/**
 * Refine vague ingredient names into more specific product search terms
 * for Kassalapp API. Without this, "melk" returns "Melkesjoko" (ice cream)
 * and "salt" returns "Saltstenger" (snacks).
 */
export const searchRefinements: Record<string, string> = {
  // Dairy
  "melk": "helmelk 1l",
  "helmelk": "helmelk 1l",
  "lettmelk": "lettmelk 1l",
  "fløte": "matfløte",
  "kremfløte": "kremfløte",
  "rømme": "rømme",
  "smør": "meierismør",
  "ost": "norvegia ost",
  "kremost": "philadelphia kremost",
  "yoghurt": "yoghurt naturell",

  // Basics
  "salt": "jodsalt",
  "pepper": "sort pepper malt",
  "sukker": "sukker dansukker",
  "mel": "hvetemel",
  "hvetemel": "hvetemel regal",
  "olje": "olivenolje",
  "olivenolje": "olivenolje extra virgin",
  "rapsolje": "rapsolje",
  "eddik": "eddik husholdning",

  // Eggs
  "egg": "egg frittgående",

  // Bread
  "brød": "grovbrød",
  "lompe": "lompe",
  "tortilla": "tortilla santa maria",

  // Grains
  "ris": "jasminris",
  "pasta": "pasta spaghetti",
  "spagetti": "spaghetti",
  "nudler": "nudler",
  "havregryn": "havregryn lettkokt",

  // Common spices
  "hvitløk": "hvitløk fersk",
  "ingefær": "ingefær fersk",
  "kanel": "kanel malt",
  "paprikapulver": "paprika malt",
  "oregano": "oregano krydder",
  "basilikum": "basilikum fersk",
  "timian": "timian krydder",
  "karri": "karripulver",

  // Sauces
  "soyasaus": "soyasaus kikkoman",
  "tomatpuré": "tomatpuré mutti",
  "tomatsaus": "tomatsaus",
  "ketchup": "ketchup heinz",
  "sennep": "sennep idun",
  "majones": "majones mills",

  // Small quantities — these are often searched with unit prefix
  "klype salt": "jodsalt",
  "fedd hvitløk": "hvitløk fersk",

  // Generic
  "vann": "", // skip — free
  "is": "", // skip — too vague
};

/**
 * Refine an ingredient name for better Kassalapp search results.
 * Returns empty string if the ingredient should be skipped (e.g., water).
 */
export function refineSearchQuery(ingredientName: string): string {
  const lower = ingredientName.toLowerCase().trim();

  // Check exact match
  if (lower in searchRefinements) {
    return searchRefinements[lower];
  }

  // Check if any refinement key is contained in the name
  for (const [key, value] of Object.entries(searchRefinements)) {
    if (lower.includes(key) && value) {
      return value;
    }
  }

  // Return original name — hopefully specific enough
  return ingredientName;
}
