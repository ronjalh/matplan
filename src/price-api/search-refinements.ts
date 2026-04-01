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

/** Units to strip from ingredient names before searching */
const UNITS_TO_STRIP = /^(g|kg|dl|l|ml|ss|ts|stk|pk|fedd|klype|bunt|kvast|dæsj)\s+/i;
const UNITS_ANYWHERE = /\b(g|kg|dl|l|ml|ss|ts|stk|pk|fedd|klype|bunt|kvast|dæsj)\b/gi;

/**
 * Clean ingredient name for price search:
 * Remove units, numbers, and common noise words.
 */
function cleanForSearch(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^[\d.,]+\s*/g, "") // remove leading numbers
    .replace(UNITS_TO_STRIP, "") // remove leading unit
    .replace(UNITS_ANYWHERE, "") // remove any remaining units
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Refine an ingredient name for better Kassalapp search results.
 * Strips units first, then checks refinements, then returns cleaned name.
 * Returns empty string if the ingredient should be skipped (e.g., water).
 */
export function refineSearchQuery(ingredientName: string): string {
  const cleaned = cleanForSearch(ingredientName);
  if (!cleaned) return "";

  // Check exact match in refinements
  if (cleaned in searchRefinements) {
    return searchRefinements[cleaned];
  }

  // Check if any refinement key is contained in the cleaned name
  for (const [key, value] of Object.entries(searchRefinements)) {
    if (cleaned.includes(key) && value) {
      return value;
    }
  }

  // Return cleaned name — no units, just the ingredient
  return cleaned;
}
