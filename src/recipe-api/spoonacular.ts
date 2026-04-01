/**
 * Spoonacular API client.
 * Free tier: 150 requests/day.
 * All results cached in database to minimize API calls.
 */

const BASE_URL = "https://api.spoonacular.com";

function getApiKey(): string {
  const key = process.env.SPOONACULAR_API_KEY;
  if (!key) throw new Error("SPOONACULAR_API_KEY not set");
  return key;
}

export interface SpoonacularSearchResult {
  id: number;
  title: string;
  image: string;
  imageType: string;
}

export interface SpoonacularSearchResponse {
  results: SpoonacularSearchResult[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface SpoonacularRecipeDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  summary: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  cuisines: string[];
  dishTypes: string[];
  extendedIngredients: SpoonacularIngredient[];
  analyzedInstructions: {
    steps: { number: number; step: string }[];
  }[];
}

export interface SpoonacularIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
  measures: {
    metric: { amount: number; unitShort: string };
    us: { amount: number; unitShort: string };
  };
}

/**
 * Search recipes with optional filters.
 */
export async function searchRecipes(params: {
  query: string;
  diet?: "vegetarian" | "vegan" | "pescetarian";
  cuisine?: string;
  maxReadyTime?: number;
  type?: string;
  number?: number;
  offset?: number;
}): Promise<SpoonacularSearchResponse> {
  const url = new URL(`${BASE_URL}/recipes/complexSearch`);
  url.searchParams.set("apiKey", getApiKey());
  url.searchParams.set("query", params.query);
  url.searchParams.set("number", String(params.number ?? 12));
  url.searchParams.set("offset", String(params.offset ?? 0));

  if (params.diet) url.searchParams.set("diet", params.diet);
  if (params.cuisine) url.searchParams.set("cuisine", params.cuisine);
  if (params.maxReadyTime) url.searchParams.set("maxReadyTime", String(params.maxReadyTime));
  if (params.type) url.searchParams.set("type", params.type);

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } }); // cache 24h
  if (!res.ok) {
    throw new Error(`Spoonacular search failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Get full recipe details including ingredients and instructions.
 */
export async function getRecipeDetails(
  recipeId: number
): Promise<SpoonacularRecipeDetail> {
  const url = `${BASE_URL}/recipes/${recipeId}/information?apiKey=${getApiKey()}&includeNutrition=false`;

  const res = await fetch(url, { next: { revalidate: 604800 } }); // cache 7 days
  if (!res.ok) {
    throw new Error(`Spoonacular recipe detail failed: ${res.status}`);
  }
  return res.json();
}
