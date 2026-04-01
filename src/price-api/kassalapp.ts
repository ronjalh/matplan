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
}

export interface KassalappSearchResponse {
  data: KassalappProduct[];
  links: { next: string | null };
}

/**
 * Search for products by name.
 */
export async function searchProducts(
  query: string,
  size: number = 5
): Promise<KassalappProduct[]> {
  const url = `${BASE_URL}/products?search=${encodeURIComponent(query)}&size=${size}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
    next: { revalidate: 86400 }, // cache 24h
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Kassalapp rate limit nådd");
    throw new Error(`Kassalapp søk feilet: ${res.status}`);
  }

  const data: KassalappSearchResponse = await res.json();
  return data.data;
}

/**
 * Search and return the best match for an ingredient name.
 * Returns the cheapest product matching the query.
 */
export async function findBestPrice(ingredientName: string): Promise<{
  product: KassalappProduct;
  priceOre: number;
} | null> {
  try {
    const products = await searchProducts(ingredientName, 5);
    if (products.length === 0) return null;

    // Sort by price, return cheapest
    const sorted = products.sort((a, b) => a.current_price - b.current_price);
    const best = sorted[0];

    return {
      product: best,
      priceOre: Math.round(best.current_price * 100),
    };
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
