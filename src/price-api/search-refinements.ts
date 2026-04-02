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
  "kveite": "kveitefilet",
  "kveitefilet": "kveitefilet",
  "steinbit": "steinbit filet",
  "sjømat": "sjømat",

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
  "agurk": "agurk fersk løsvekt",
  "spinat": "spinat fersk",
  "babyspinat": "babyspinat",
  "salat": "isbergsalat",
  "sopp": "sjampinjong",
  "champignon": "sjampinjong",
  "mais": "mais hermetisk",
  "erter": "erter frosne",
  "sukkererter": "sukkererter friske",
  "edamame": "edamame frossen",
  "edamamebønner": "edamame frossen",
  "squash": "squash fersk",
  "aubergine": "aubergine",
  "avokado": "avokado frukt fersk",
  "avocado": "avokado frukt fersk",
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
  "sitron": "sitron løsvekt",
  "lime": "lime løsvekt",
  "eple": "epler pose",
  "epler": "epler pose",
  "banan": "bananer løsvekt",
  "bananer": "bananer løsvekt",
  "appelsin": "appelsin løsvekt",
  "mango": "mango fersk",
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

  // === ENGELSKE INGREDIENSER (fra Spoonacular) ===
  "chicken breast": "kyllingfilet prior",
  "chicken thigh": "kyllinglår",
  "ground beef": "kjøttdeig gilde",
  "beef": "storfe kjøtt",
  "salmon": "laksefilet fersk",
  "shrimp": "reker pillede",
  "flaky fish": "torskefilet fersk",
  "white fish": "torskefilet fersk",
  "fish fillet": "torskefilet fersk",
  "fish": "torskefilet fersk",
  "onion": "gul løk",
  "garlic": "hvitløk fersk",
  "tomato": "tomater løsvekt",
  "tomatoes": "tomater løsvekt",
  "lemon": "sitron løsvekt",
  "lemon juice": "sitronsaft",
  "lime juice": "limesaft",
  "olive oil": "olivenolje extra virgin",
  "butter": "meierismør tine",
  "cream": "matfløte tine",
  "milk": "helmelk tine",
  "cheese": "norvegia ost",
  "rice": "jasminris",
  "flour": "hvetemel regal",
  "sugar": "sukker dansukker",
  "cilantro": "koriander fersk",
  "coriander": "koriander fersk",
  "jalapeno": "chili jalapeño",
  "jalapeño": "chili jalapeño",
  "greek yogurt": "gresk yoghurt",
  "nonfat greek yogurt": "gresk yoghurt",
  "yogurt": "yoghurt naturell",
  "sour cream": "rømme tine",
  "tequila": "tequila",
  "tortillas": "tortilla lefse",
  "black beans": "svarte bønner hermetisk",
  "corn": "mais hermetisk",
  "cumin": "spisskummen malt",
  "bell pepper": "paprika rød fersk",
  "broccoli": "brokkoli fersk",
  "carrot": "gulrøtter pose",
  "potato": "poteter løsvekt",
  "ginger": "ingefær fersk",
  "soy sauce": "soyasaus kikkoman",
  "sesame oil": "sesamolje",
  "coconut milk": "kokosmelk",
  "curry powder": "karri malt",
  "basil": "basilikum fersk",
  "thyme": "timian tørket",
  "parsley": "persille fersk",
  "bay leaf": "laubærblad",
  "bay leaves": "laubærblad",
  "cinnamon": "kanel malt",
  "nutmeg": "muskatnøtt malt",
  "maple syrup": "sirup",
  "balsamic vinegar": "balsamicoeddik",
  "worcestershire sauce": "worcestershiresaus",
  "hot sauce": "tabasco",
  "peanut butter": "peanøttsmør",
  "noodles": "nudler",
  "bread": "grovbrød",
  "eggs": "egg frittgående",
  "ham": "kokt skinke gilde",
  "sausage": "grillpølse gilde",

  // === SKIP (gratis/ubetydelig) ===
  "vann": "",
  "is": "",
  "salt og pepper": "",
  "salt and pepper": "",
};

/** Units and noise words to strip from ingredient names.
 * NOTE: "l" (liter) is NOT included as single char — it would strip "l" from "løk" → "øk".
 * Use "dl", "ml", "l " (with space) patterns instead.
 */
const STRIP_PATTERN = /\b(\d+[\d.,]*\s*)?(g|kg|dl|ml|ss|ts|stk|pk|fedd|klype|bunt|kvast|dæsj|porsjon|neve|blad|skive|bx|glass|tbsp|tbsps|tsp|tsps|cup|cups|oz|lb|lbs|serving|servings|tablespoon|tablespoons|teaspoon|teaspoons|pinch|dash|small|medium|large|handful|can|cans|piece|pieces|whole|fresh|dried|chopped|minced|sliced|diced|crushed|to taste)\b/gi;

/**
 * Clean ingredient name for search: strip units, numbers, adjectives.
 */
function cleanName(name: string): string {
  return name
    .replace(/^[\d.,]+\s*/g, "") // strip leading numbers
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

  // 3. Check if any refinement key appears as a whole word in the cleaned name
  // Use space/start/end boundaries instead of \b (which fails with ø, å, æ)
  // Sort by key length descending to match longer keys first
  const sortedEntries = Object.entries(refinements).sort((a, b) => b[0].length - a[0].length);
  for (const [key, value] of sortedEntries) {
    if (!value) continue;
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(cleaned) || cleaned === key) {
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
