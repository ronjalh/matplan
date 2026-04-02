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

/** Categories to exclude — baby food, snacks, etc. that pollute results */
const EXCLUDE_CATEGORIES = new Set([
  "Barnemat",
  "Barneprodukter",
  "Is",
  "Iskrem",
  "Snacks",
  "Godteri",
]);

/** Words in product names that indicate it's not a raw ingredient */
const EXCLUDE_NAME_PATTERNS = /\b(barnegrøt|babymat|barnemat|iskrem|is\s|sjokolademelk|smoothie|gele|drops|pastill)\b/i;

/**
 * Filter out irrelevant products (baby food, ice cream, snacks).
 */
function filterRelevant(products: KassalappProduct[]): KassalappProduct[] {
  return products.filter((p) => {
    // Exclude by category
    if (p.category?.some((c) => EXCLUDE_CATEGORIES.has(c.name))) return false;
    // Exclude by name pattern
    if (EXCLUDE_NAME_PATTERNS.test(p.name)) return false;
    return true;
  });
}

/**
 * Search and return the best match for an ingredient name.
 *
 * Strategy:
 * 1. Refine the search query (ingredient name → product search term)
 * 2. Search Kassalapp with the refined query
 * 3. Filter out irrelevant results (baby food, snacks)
 * 4. Return cheapest remaining product
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

    if (relevant.length > 0) {
      const sorted = relevant.sort((a, b) => a.current_price - b.current_price);
      return {
        product: sorted[0],
        priceOre: Math.round(sorted[0].current_price * 100),
      };
    }

    // If all filtered out, try the unfiltered cheapest as fallback
    if (products.length > 0) {
      const sorted = products.sort((a, b) => a.current_price - b.current_price);
      return {
        product: sorted[0],
        priceOre: Math.round(sorted[0].current_price * 100),
      };
    }

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
