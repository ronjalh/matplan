/**
 * Kassalapp API client — Norwegian grocery prices across all chains.
 * Free tier: 60 requests/min.
 */

const BASE_URL = "https://kassal.app/api/v1";

function getApiKey(): string {
  const key = process.env.KASSALAPP_API_KEY;
  if (!key) throw new Error("KASSALAPP_API_KEY not set");
  return key;
}

export interface KassalappProduct {
  id: number;
  name: string;
  brand: string | null;
  current_price: number;
  current_unit_price: number | null;
  weight: number | null;
  weight_unit: string | null;
  image: string | null;
  store: {
    name: string;
    code: string;
    logo: string;
  };
  category?: { name: string }[];
}

export interface KassalappSearchResponse {
  data: KassalappProduct[];
  links: { next: string | null };
}

/**
 * Search for products by name. Handles URL encoding for Norwegian chars.
 */
export async function searchProducts(
  query: string,
  size: number = 10
): Promise<KassalappProduct[]> {
  const url = `${BASE_URL}/products?search=${encodeURIComponent(query)}&size=${size}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Kassalapp rate limit nådd");
    throw new Error(`Kassalapp søk feilet: ${res.status}`);
  }

  const data: KassalappSearchResponse = await res.json();
  return data.data ?? [];
}

import { refineSearchQuery } from "./search-refinements";

/** Categories to exclude — baby food, snacks, etc. */
const EXCLUDE_CATEGORIES = new Set([
  "Barnemat", "Barneprodukter", "Is", "Iskrem", "Snacks", "Godteri",
]);

/** Name patterns to exclude */
const EXCLUDE_NAME_PATTERNS = /\b(barnegrøt|babymat|barnemat|babysmoothie|ispinne|iskrem|sjokolademelk|smoothie|gele|drops|pastill|godtepose|chips|potetgull|snacksboks|6mnd|8mnd|12mnd)\b/i;

/** Check if product is a bulk/commercial package */
function isLikelyBulkPackage(p: KassalappProduct): boolean {
  if (p.weight && p.weight_unit === "kg" && p.weight > 2.5) return true;
  if (p.weight && p.weight_unit === "g" && p.weight > 2500) return true;
  if (/\b(\d+\s*x\s*\d+|storkjøkken|storhusholdning|catering|kasse|storpack)\b/i.test(p.name)) return true;
  return false;
}

/** Score how well a product matches the search query */
function scoreMatch(product: KassalappProduct, searchTerms: string[]): number {
  const name = product.name.toLowerCase();
  let score = 0;

  for (const term of searchTerms) {
    const t = term.toLowerCase();
    if (t.length < 2) continue;
    if (name.startsWith(t)) {
      score += 20; // Strong: product name STARTS with search term
    } else if (name.includes(t)) {
      const idx = name.indexOf(t);
      const before = name.slice(Math.max(0, idx - 3), idx);
      if (/\bi\s|&|med\s|\//.test(before)) {
        score += 2; // Weak: sub-ingredient ("Makrell i Salsa")
      } else {
        score += 10;
      }
    }
  }

  // Penalize wrong product types
  const PENALTY_WORDS = ["sylte", "syltet", "pulver", "tørket", "konsentr", "granulat", "dressing", "pålegg", "smudi", "smoothie"];
  for (const pw of PENALTY_WORDS) {
    if (name.includes(pw) && !searchTerms.some(t => t.includes(pw))) score -= 15;
  }

  // Penalize baby food/bulk
  if (/6mnd|8mnd|12mnd|barnegrøt|babymat/i.test(name)) score -= 30;
  if (isLikelyBulkPackage(product)) score -= 20;

  // Prefer shorter names (less noise = more likely a simple product)
  score -= name.length * 0.1;

  return score;
}

/** Max reasonable price per category (in øre) */
const MAX_PRICE_ORE = 25000; // kr 250

/**
 * Filter out irrelevant products.
 */
function filterRelevant(products: KassalappProduct[]): KassalappProduct[] {
  return products.filter((p) => {
    if (p.category?.some((c) => EXCLUDE_CATEGORIES.has(c.name))) return false;
    if (EXCLUDE_NAME_PATTERNS.test(p.name)) return false;
    if (isLikelyBulkPackage(p)) return false;
    return true;
  });
}

/**
 * Search and return the best match for an ingredient name.
 * Uses: refinement → search → filter → score → sanity check.
 */
export async function findBestPrice(ingredientName: string): Promise<{
  product: KassalappProduct;
  priceOre: number;
} | null> {
  try {
    const query = refineSearchQuery(ingredientName);
    if (!query) return null;

    const products = await searchProducts(query, 10);
    const relevant = filterRelevant(products);

    const searchTerms = query.toLowerCase().split(/\s+/);

    // Sort by relevance score first, then by price
    const scored = (relevant.length > 0 ? relevant : products)
      .map((p) => ({ product: p, score: scoreMatch(p, searchTerms) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.product.current_price - b.product.current_price;
      });

    // Find first result within sanity price limit
    for (const { product } of scored) {
      const priceOre = Math.round(product.current_price * 100);
      if (priceOre <= MAX_PRICE_ORE) {
        return { product, priceOre };
      }
    }

    // If all prices are insane, return null
    return null;
  } catch {
    return null;
  }
}

/**
 * Format price in NOK.
 */
export function formatNOK(priceOre: number): string {
  const kr = priceOre / 100;
  return `kr ${kr.toFixed(2).replace(".", ",")}`;
}
