/**
 * English → Norwegian ingredient name translations.
 * Used when importing recipes from Spoonacular (English) and matching
 * against Norwegian grocery store products (Kassalapp/Oda).
 *
 * ~200 entries covering ~80% of common recipe ingredients.
 * The remaining ~20% is handled by fuzzy search + user-learned links.
 */
export const ingredientTranslations: Record<string, string> = {
  // Protein — Meat
  "chicken breast": "kyllingfilet",
  "chicken thigh": "kyllinglår",
  "chicken": "kylling",
  "ground beef": "kjøttdeig",
  "beef": "storfe",
  "steak": "biff",
  "pork": "svinekjøtt",
  "pork chop": "svinekotelett",
  "bacon": "bacon",
  "ham": "skinke",
  "sausage": "pølse",
  "lamb": "lam",
  "ground turkey": "kalkunkjøttdeig",
  "turkey": "kalkun",

  // Protein — Fish & Seafood
  "salmon": "laks",
  "cod": "torsk",
  "shrimp": "reker",
  "prawns": "reker",
  "tuna": "tunfisk",
  "mackerel": "makrell",
  "trout": "ørret",
  "herring": "sild",
  "haddock": "hyse",
  "pollock": "sei",
  "mussels": "blåskjell",
  "crab": "krabbe",

  // Protein — Other
  "egg": "egg",
  "eggs": "egg",
  "tofu": "tofu",
  "tempeh": "tempeh",
  "lentils": "linser",
  "red lentils": "røde linser",
  "chickpeas": "kikerter",
  "black beans": "svarte bønner",
  "kidney beans": "kidneybønner",
  "white beans": "hvite bønner",
  "cannellini beans": "cannellinibønner",
  "edamame": "edamame",

  // Vegetables
  "onion": "løk",
  "red onion": "rødløk",
  "garlic": "hvitløk",
  "potato": "potet",
  "potatoes": "poteter",
  "sweet potato": "søtpotet",
  "carrot": "gulrot",
  "carrots": "gulrøtter",
  "broccoli": "brokkoli",
  "cauliflower": "blomkål",
  "bell pepper": "paprika",
  "red bell pepper": "rød paprika",
  "green bell pepper": "grønn paprika",
  "tomato": "tomat",
  "tomatoes": "tomater",
  "cherry tomatoes": "cherrytomater",
  "cucumber": "agurk",
  "spinach": "spinat",
  "lettuce": "salat",
  "kale": "grønnkål",
  "cabbage": "hodekål",
  "red cabbage": "rødkål",
  "mushroom": "sopp",
  "mushrooms": "sopp",
  "zucchini": "squash",
  "eggplant": "aubergine",
  "corn": "mais",
  "peas": "erter",
  "green beans": "grønne bønner",
  "asparagus": "asparges",
  "leek": "purre",
  "celery": "selleri",
  "celeriac": "sellerirot",
  "beetroot": "rødbeter",
  "beets": "rødbeter",
  "turnip": "nepe",
  "parsnip": "pastinakk",
  "radish": "reddik",
  "artichoke": "artisjokk",
  "avocado": "avokado",
  "spring onion": "vårløk",
  "scallion": "vårløk",
  "green onion": "vårløk",
  "ginger": "ingefær",
  "fresh ginger": "fersk ingefær",
  "pumpkin": "gresskar",
  "butternut squash": "butternut-gresskar",

  // Fruit
  "apple": "eple",
  "banana": "banan",
  "orange": "appelsin",
  "lemon": "sitron",
  "lime": "lime",
  "lemon juice": "sitronsaft",
  "lime juice": "limesaft",
  "strawberry": "jordbær",
  "strawberries": "jordbær",
  "blueberry": "blåbær",
  "blueberries": "blåbær",
  "raspberry": "bringebær",
  "raspberries": "bringebær",
  "mango": "mango",
  "pineapple": "ananas",
  "grape": "drue",
  "grapes": "druer",
  "pear": "pære",
  "peach": "fersken",
  "plum": "plomme",
  "cherry": "kirsebær",
  "cherries": "kirsebær",
  "watermelon": "vannmelon",
  "coconut": "kokosnøtt",
  "rhubarb": "rabarbra",
  "cranberries": "tranebær",
  "dates": "dadler",
  "raisins": "rosiner",
  "dried apricots": "tørkede aprikoser",

  // Dairy
  "milk": "melk",
  "whole milk": "helmelk",
  "butter": "smør",
  "cream": "fløte",
  "heavy cream": "kremfløte",
  "whipping cream": "kremfløte",
  "sour cream": "rømme",
  "cream cheese": "kremost",
  "cheese": "ost",
  "parmesan": "parmesan",
  "mozzarella": "mozzarella",
  "cheddar": "cheddar",
  "feta": "fetaost",
  "gouda": "gouda",
  "ricotta": "ricotta",
  "yogurt": "yoghurt",
  "greek yogurt": "gresk yoghurt",
  "plain yogurt": "naturell yoghurt",

  // Grains & Carbs
  "rice": "ris",
  "white rice": "hvit ris",
  "brown rice": "brune ris",
  "basmati rice": "basmatris",
  "jasmine rice": "jasminris",
  "pasta": "pasta",
  "spaghetti": "spagetti",
  "penne": "penne",
  "noodles": "nudler",
  "egg noodles": "eggnudler",
  "rice noodles": "risnudler",
  "bread": "brød",
  "flour": "hvetemel",
  "all-purpose flour": "hvetemel",
  "whole wheat flour": "fullkornsmel",
  "bread crumbs": "brødsmuler",
  "panko": "panko",
  "oats": "havregryn",
  "rolled oats": "havregryn",
  "couscous": "couscous",
  "quinoa": "quinoa",
  "tortilla": "tortilla",
  "tortillas": "tortillaer",
  "pita bread": "pitabrød",
  "cornstarch": "maisstivelse",
  "potato starch": "potetmel",

  // Fats & Oils
  "olive oil": "olivenolje",
  "extra virgin olive oil": "ekstra virgin olivenolje",
  "vegetable oil": "rapsolje",
  "canola oil": "rapsolje",
  "coconut oil": "kokosolje",
  "sesame oil": "sesamolje",
  "peanut oil": "peanøttolje",

  // Herbs & Spices
  "salt": "salt",
  "pepper": "pepper",
  "black pepper": "sort pepper",
  "basil": "basilikum",
  "fresh basil": "fersk basilikum",
  "oregano": "oregano",
  "thyme": "timian",
  "rosemary": "rosmarin",
  "parsley": "persille",
  "fresh parsley": "fersk persille",
  "cilantro": "koriander",
  "coriander": "koriander",
  "dill": "dill",
  "chives": "gressløk",
  "mint": "mynte",
  "bay leaf": "laubærblad",
  "bay leaves": "laubærblad",
  "cinnamon": "kanel",
  "cumin": "spisskummen",
  "paprika": "paprikapulver",
  "smoked paprika": "røkt paprika",
  "chili powder": "chilipulver",
  "chili flakes": "chilifakes",
  "red pepper flakes": "chilifakes",
  "cayenne pepper": "kajennepepper",
  "turmeric": "gurkemeie",
  "nutmeg": "muskatnøtt",
  "cardamom": "kardemomme",
  "cloves": "nellik",
  "curry powder": "karripulver",
  "garam masala": "garam masala",
  "italian seasoning": "italiensk krydder",
  "vanilla extract": "vaniljeekstrakt",
  "vanilla": "vanilje",

  // Sauces & Condiments
  "soy sauce": "soyasaus",
  "tomato paste": "tomatpuré",
  "tomato sauce": "tomatsaus",
  "canned tomatoes": "hermetiske tomater",
  "crushed tomatoes": "knuste tomater",
  "diced tomatoes": "hakkede tomater",
  "ketchup": "ketchup",
  "mustard": "sennep",
  "dijon mustard": "dijonsennep",
  "mayonnaise": "majones",
  "vinegar": "eddik",
  "white vinegar": "hviteddik",
  "balsamic vinegar": "balsamicoeddik",
  "apple cider vinegar": "epleeddik",
  "rice vinegar": "riseddik",
  "honey": "honning",
  "maple syrup": "lønnesirup",
  "worcestershire sauce": "worcestershiresaus",
  "fish sauce": "fiskesaus",
  "oyster sauce": "østerssaus",
  "hot sauce": "chilisaus",
  "sriracha": "sriracha",
  "pesto": "pesto",
  "tahini": "tahini",
  "miso paste": "misopasta",
  "coconut milk": "kokosmelk",
  "coconut cream": "kokosfløte",

  // Baking & Sweeteners
  "sugar": "sukker",
  "brown sugar": "brunt sukker",
  "powdered sugar": "melis",
  "baking powder": "bakepulver",
  "baking soda": "natron",
  "yeast": "gjær",
  "cocoa powder": "kakaopulver",
  "chocolate": "sjokolade",
  "dark chocolate": "mørk sjokolade",
  "chocolate chips": "sjokoladebiter",

  // Nuts & Seeds
  "almonds": "mandler",
  "walnuts": "valnøtter",
  "cashews": "cashewnøtter",
  "peanuts": "peanøtter",
  "pine nuts": "pinjekjerner",
  "pecans": "pekannøtter",
  "pistachios": "pistasjenøtter",
  "peanut butter": "peanøttsmør",
  "almond butter": "mandelsmør",
  "sesame seeds": "sesamfrø",
  "sunflower seeds": "solsikkefrø",
  "pumpkin seeds": "gresskarkjerner",
  "chia seeds": "chiafrø",
  "flax seeds": "linfrø",

  // Liquids & Stock
  "water": "vann",
  "chicken broth": "kyllingbuljong",
  "chicken stock": "kyllingbuljong",
  "vegetable broth": "grønnsaksbuljong",
  "vegetable stock": "grønnsaksbuljong",
  "beef broth": "oksekraftbuljong",
  "beef stock": "oksekraftbuljong",
  "white wine": "hvitvin",
  "red wine": "rødvin",
  "beer": "øl",
};

/**
 * Normalize an ingredient name for lookup.
 * Lowercase, trim, remove trailing 's' for basic depluralization.
 */
export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Translate an English ingredient name to Norwegian.
 * Returns the Norwegian name if found, or the original English name.
 */
export function translateIngredient(englishName: string): {
  norwegian: string;
  wasTranslated: boolean;
} {
  const normalized = normalizeIngredientName(englishName);

  // Direct match
  if (ingredientTranslations[normalized]) {
    return { norwegian: ingredientTranslations[normalized], wasTranslated: true };
  }

  // Try without trailing 's' (basic depluralize)
  const singular = normalized.replace(/s$/, "");
  if (ingredientTranslations[singular]) {
    return { norwegian: ingredientTranslations[singular], wasTranslated: true };
  }

  // Try without common prefixes
  const withoutPrefix = normalized
    .replace(/^(fresh |dried |ground |chopped |minced |sliced |diced |crushed |whole |large |small |medium )/g, "");
  if (ingredientTranslations[withoutPrefix]) {
    return { norwegian: ingredientTranslations[withoutPrefix], wasTranslated: true };
  }

  return { norwegian: englishName, wasTranslated: false };
}
