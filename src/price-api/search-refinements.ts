/**
 * Smart ingredient → product search mapping for Kassalapp API.
 *
 * Problem: searching "laks" returns baby food, "salt" returns ice cream.
 * Solution: map ingredient names to specific product search queries.
 *
 * Strategy:
 * 1. Check exact refinement match
 * 2. Check partial match (ingredient name contains a refinement key)
 * 3. Clean the name (strip units, numbers, adjectives)
 * 4. Try the cleaned name as-is (may work for specific ingredients)
 */

/**
 * Maps ingredient names to specific product search queries.
 * Each value is what we actually search for in Kassalapp.
 */
const refinements: Record<string, string> = {
  // === MEIERI ===
  "melk": "helmelk tine",
  "helmelk": "helmelk tine",
  "lettmelk": "lettmelk tine",
  "skummet melk": "skummetmelk tine",
  "fløte": "matfløte tine",
  "kremfløte": "kremfløte tine",
  "matfløte": "matfløte tine",
  "rømme": "lettrømme tine",
  "smør": "meierismør tine",
  "ost": "norvegia ost",
  "kremost": "philadelphia kremost",
  "yoghurt": "yoghurt naturell tine",
  "egg": "egg frittgående",
  "parmesan": "parmesan ost",
  "mozzarella": "mozzarella ost",
  "feta": "fetaost",
  "cheddar": "cheddar ost",
  "ricotta": "ricotta ost",

  // === KJØTT ===
  "kylling": "kyllingfilet prior",
  "kyllingfilet": "kyllingfilet prior",
  "kyllinglår": "kyllinglår prior",
  "kjøttdeig": "kjøttdeig gilde",
  "bacon": "bacon gilde",
  "pølse": "grillpølse gilde",
  "skinke": "kokt skinke gilde",
  "lam": "lammekjøtt",
  "svinekjøtt": "svinekoteletter",
  "biff": "entrecote storfe",

  // === FISK ===
  "laks": "laksefilet fersk",
  "laksefilet": "laksefilet fersk",
  "torsk": "torskefilet fersk",
  "sei": "seifiletr fersk",
  "reker": "reker pillede",
  "tunfisk": "tunfisk boks",
  "makrell": "makrell boks",

  // === GRØNNSAKER ===
  "løk": "gul løk",
  "rødløk": "rødløk",
  "hvitløk": "hvitløk fersk",
  "potet": "poteter løsvekt",
  "poteter": "poteter løsvekt",
  "gulrot": "gulrøtter pose",
  "gulrøtter": "gulrøtter pose",
  "brokkoli": "brokkoli fersk",
  "blomkål": "blomkål fersk",
  "paprika": "paprika rød",
  "tomat": "tomater løsvekt",
  "tomater": "tomater løsvekt",
  "cherrytomater": "cherrytomater",
  "agurk": "agurk fersk",
  "spinat": "spinat fersk",
  "salat": "isbergsalat",
  "sopp": "sjampinjong",
  "mais": "mais hermetisk",
  "erter": "erter frosne",
  "squash": "squash fersk",
  "aubergine": "aubergine",
  "avokado": "avokado",
  "søtpotet": "søtpotet",
  "purre": "purreløk",
  "selleri": "stangselleri",
  "rødbeter": "rødbeter",
  "asparges": "asparges fersk",
  "grønnkål": "grønnkål",
  "hodekål": "hodekål",
  "rødkål": "rødkål",
  "vårløk": "vårløk",

  // === FRUKT ===
  "sitron": "sitron frukt",
  "lime": "lime frukt",
  "eple": "epler pose",
  "banan": "bananer",
  "appelsin": "appelsin",
  "mango": "mango frukt",
  "ananas": "ananas fersk",

  // === TØRRVARER ===
  "ris": "jasminris",
  "jasminris": "jasminris",
  "basmatris": "basmatris",
  "pasta": "spaghetti barilla",
  "spaghetti": "spaghetti barilla",
  "penne": "penne barilla",
  "nudler": "nudler",
  "mel": "hvetemel",
  "hvetemel": "hvetemel regal",
  "havregryn": "havregryn lettkokt",
  "couscous": "couscous",
  "quinoa": "quinoa",
  "tortilla": "tortilla lefse",
  "brød": "grovbrød",
  "lompe": "lompe",
  "pitabrød": "pitabrød",
  "panko": "panko",
  "maisstivelse": "maisenna",
  "linser": "linser",
  "kikerter": "kikerter hermetisk",

  // === HERMETIKK ===
  "hermetiske tomater": "hermetiske tomater",
  "knuste tomater": "knuste tomater mutti",
  "tomatpuré": "tomatpuré mutti",
  "tomatsaus": "tomatsaus",
  "kokosmjølk": "kokosmelk",
  "kokosmelk": "kokosmelk",

  // === KRYDDER OG SMAK ===
  "salt": "jodsalt",
  "pepper": "sort pepper kvern",
  "sort pepper": "sort pepper kvern",
  "hvitpepper": "hvitpepper",
  "kanel": "kanel malt",
  "karri": "karri malt",
  "paprikapulver": "paprika malt",
  "oregano": "oregano tørket",
  "basilikum": "basilikum fersk",
  "timian": "timian tørket",
  "rosmarin": "rosmarin tørket",
  "persille": "persille fersk",
  "koriander": "koriander malt",
  "dill": "dill fersk",
  "gressløk": "gressløk fersk",
  "ingefær": "ingefær fersk",
  "gurkemeie": "gurkemeie malt",
  "spisskummen": "spisskummen malt",
  "muskatnøtt": "muskatnøtt malt",
  "kardemomme": "kardemomme malt",
  "chilipulver": "chili malt",
  "chilifakes": "chilifakes",
  "laubærblad": "laubærblad",
  "vanilje": "vaniljesukker",

  // === SAUSER OG TILBEHØR ===
  "soyasaus": "soyasaus kikkoman",
  "ketchup": "ketchup heinz",
  "sennep": "sennep idun",
  "majones": "majones mills",
  "eddik": "eddik husholdning",
  "balsamicoeddik": "balsamicoeddik",
  "pesto": "pesto grønn",
  "sriracha": "sriracha saus",
  "tabasco": "tabasco",
  "honning": "honning",
  "sirup": "sirup lys",
  "sukker": "sukker dansukker",
  "brunt sukker": "muscovadosukker",
  "melis": "melis dansukker",

  // === OLJE OG FETT ===
  "olivenolje": "olivenolje extra virgin",
  "olje": "rapsolje",
  "rapsolje": "rapsolje",
  "kokosolje": "kokosolje",
  "sesamolje": "sesamolje",

  // === BAKST ===
  "bakepulver": "bakepulver",
  "natron": "natron",
  "gjær": "gjær tørrgjær",
  "kakaopulver": "kakao",
  "sjokolade": "mørk sjokolade",
  "vaniljeekstrakt": "vaniljeekstrakt",

  // === NØTTER OG FRØ ===
  "mandler": "mandler",
  "valnøtter": "valnøtter",
  "cashewnøtter": "cashewnøtter",
  "peanøtter": "peanøtter",
  "pinjekjerner": "pinjekjerner",
  "sesamfrø": "sesamfrø",
  "solsikkefrø": "solsikkefrø",

  // === SKIP (gratis/ubetydelig) ===
  "vann": "",
  "is": "",
  "salt og pepper": "",
  "salt and pepper": "",
};

/** Units and noise words to strip from ingredient names */
const STRIP_PATTERN = /\b(\d+[\d.,]*\s*)?(g|kg|dl|l|ml|ss|ts|stk|pk|fedd|klype|bunt|kvast|dæsj|porsjon|neve|blad|skive|bx|glass|tbsp|tbsps|tsp|tsps|cup|cups|oz|lb|lbs|serving|servings|tablespoon|tablespoons|teaspoon|teaspoons|pinch|dash|small|medium|large|handful|can|cans|piece|pieces|whole|fresh|dried|ground|chopped|minced|sliced|diced|crushed|to taste)\b/gi;

/**
 * Clean ingredient name for search: strip units, numbers, adjectives.
 */
function cleanName(name: string): string {
  return name
    .replace(STRIP_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Get the best Kassalapp search query for an ingredient name.
 * Returns empty string if the ingredient should be skipped.
 *
 * Strategy:
 * 1. Clean the name (strip units etc.)
 * 2. Exact match in refinements
 * 3. Partial match (refinement key found in name)
 * 4. Return cleaned name as fallback
 */
export function refineSearchQuery(ingredientName: string): string {
  const cleaned = cleanName(ingredientName);
  if (!cleaned) return "";

  // 1. Exact match
  if (cleaned in refinements) {
    return refinements[cleaned];
  }

  // 2. Try each word individually (for compound ingredients like "fresh basil leaves")
  const words = cleaned.split(" ");
  for (const word of words) {
    if (word in refinements) {
      return refinements[word];
    }
  }

  // 3. Check if any refinement key is contained in the cleaned name
  for (const [key, value] of Object.entries(refinements)) {
    if (cleaned.includes(key) && value) {
      return value;
    }
  }

  // 4. Try first word + second word combination
  if (words.length >= 2) {
    const twoWords = `${words[0]} ${words[1]}`;
    if (twoWords in refinements) {
      return refinements[twoWords];
    }
  }

  // 5. Return cleaned name — Kassalapp might still find something useful
  return cleaned;
}
