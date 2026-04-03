import { describe, it, expect } from "vitest";
import { refineSearchQuery } from "./search-refinements";
import { matpratRecipes } from "@/data/matprat-recipes";

// ============================================================================
// Common Norwegian grocery items organized by category (~600 items)
// ============================================================================

const norwegianGroceries: Record<string, string[]> = {
  // === MEIERI ===
  Meieri: [
    "melk",
    "helmelk",
    "lettmelk",
    "skummet melk",
    "skummetmelk",
    "laktosfri melk",
    "havremelk",
    "soyadrikk",
    "mandelmelk",
    "fløte",
    "kremfløte",
    "matfløte",
    "pisket krem",
    "lettrømme",
    "rømme",
    "seterrømme",
    "crème fraîche",
    "smør",
    "meierismør",
    "smør lett",
    "margarin",
    "bremykt",
    "ost",
    "norvegia",
    "jarlsberg",
    "gulost",
    "brunost",
    "geitost",
    "edamer",
    "gouda",
    "parmesan",
    "mozzarella",
    "feta",
    "fetaost",
    "cheddar",
    "kremost",
    "philadelphia",
    "brie",
    "camembert",
    "ricotta",
    "cottage cheese",
    "mascarpone",
    "halloumi",
    "egg",
    "eggeplomme",
    "eggehvite",
    "yoghurt",
    "yoghurt naturell",
    "gresk yoghurt",
    "skyr",
    "kulturmelk",
    "kefir",
    "riskrem",
  ],

  // === KJØTT ===
  Kjøtt: [
    "kylling",
    "kyllingfilet",
    "kyllinglår",
    "kyllingvinger",
    "hel kylling",
    "kyllingbryst",
    "kyllingkjøttdeig",
    "kalkun",
    "kalkunfilet",
    "kalkunpålegg",
    "kjøttdeig",
    "kjøttdeig svin/storfe",
    "kjøttdeig kylling",
    "kjøttdeig lam",
    "bacon",
    "baconterninger",
    "pancetta",
    "pølse",
    "grillpølse",
    "wiener",
    "medisterpølse",
    "salami",
    "skinke",
    "kokt skinke",
    "spekeskinke",
    "spekemat",
    "serranoskinke",
    "biff",
    "biffkjøtt",
    "entrecôte",
    "ytrefilet",
    "indrefilet",
    "flatbiff",
    "mørbrad",
    "roastbiff",
    "oksekjøtt",
    "storfe",
    "storfekjøtt",
    "lam",
    "lammekjøtt",
    "lammelår",
    "lammekoteletter",
    "lammebog",
    "svinekjøtt",
    "svinekoteletter",
    "svinefilet",
    "svineribbe",
    "svinenakke",
    "pulled pork",
    "ribbe",
    "pinnekjøtt",
    "kjøttpølse",
    "leverpostei",
    "nuggets",
    "kyllingnuggets",
    "and",
    "andebryst",
    "vilt",
    "elg",
    "hjort",
    "reinsdyr",
    "reinsdyrkjøtt",
    "kebabkjøtt",
  ],

  // === FISK OG SJØMAT ===
  "Fisk og sjømat": [
    "laks",
    "laksefilet",
    "røkt laks",
    "røkelaks",
    "gravet laks",
    "torsk",
    "torskefilet",
    "klippfisk",
    "lutefisk",
    "tørrfisk",
    "sei",
    "seifiletr",
    "seifilet",
    "hyse",
    "hysefilet",
    "kveite",
    "kveitefilet",
    "ørret",
    "ørretfilet",
    "røkt ørret",
    "steinbit",
    "steinbitfilet",
    "pangasius",
    "tilapia",
    "reker",
    "reker pillede",
    "reker kokte",
    "scampi",
    "blåskjell",
    "krabbe",
    "krabbeklør",
    "hummer",
    "kamskjell",
    "tunfisk",
    "tunfisk boks",
    "makrell",
    "makrell i tomat",
    "sardiner",
    "ansjos",
    "fiskepinner",
    "fiskekaker",
    "fiskeboller",
    "fiskesuppe",
    "rekesalat",
    "kaviar",
    "sild",
    "røkt sild",
  ],

  // === FRUKT ===
  Frukt: [
    "eple",
    "epler",
    "banan",
    "bananer",
    "appelsin",
    "appelsiner",
    "klementin",
    "mandarin",
    "sitron",
    "sitroner",
    "lime",
    "grapefrukt",
    "mango",
    "ananas",
    "druer",
    "pære",
    "pærer",
    "fersken",
    "nektarin",
    "plomme",
    "plommer",
    "aprikos",
    "kirsebær",
    "jordbær",
    "bringebær",
    "blåbær",
    "solbær",
    "rips",
    "stikkelsbær",
    "tyttebær",
    "multer",
    "avokado",
    "avocado",
    "vannmelon",
    "melon",
    "honningmelon",
    "kiwi",
    "granateple",
    "pasjonsfrukt",
    "papaya",
    "litchi",
    "kokos",
    "dadler",
    "fiken",
    "tørkede aprikoser",
    "rosiner",
    "tørkede tranebær",
  ],

  // === GRØNNSAKER ===
  Grønnsaker: [
    "løk",
    "gul løk",
    "rødløk",
    "hvitløk",
    "vårløk",
    "sjalottløk",
    "purre",
    "purreløk",
    "gulrot",
    "gulrøtter",
    "potet",
    "poteter",
    "søtpotet",
    "tomat",
    "tomater",
    "cherrytomater",
    "hermetiske tomater",
    "soltørkede tomater",
    "brokkoli",
    "blomkål",
    "paprika",
    "rød paprika",
    "grønn paprika",
    "gul paprika",
    "agurk",
    "spinat",
    "babyspinat",
    "grønnkål",
    "mangold",
    "salat",
    "isbergsalat",
    "romaine",
    "rucola",
    "sopp",
    "sjampinjong",
    "portobello",
    "kantarell",
    "steinsopp",
    "østerssopp",
    "squash",
    "aubergine",
    "selleri",
    "stangselleri",
    "sellerirot",
    "mais",
    "sukkererter",
    "edamame",
    "edamamebønner",
    "erter",
    "grønne bønner",
    "asparges",
    "hodekål",
    "rødkål",
    "kinakål",
    "pak choi",
    "rosenkål",
    "kålrabi",
    "kålrot",
    "fennikel",
    "rødbeter",
    "reddiker",
    "chili",
    "jalapeño",
    "habanero",
    "oliven",
    "sylteagurk",
    "artisjokk",
    "brokkolitopper",
    "wokgrønnsaker",
    "frosne grønnsaker",
    "bønner",
    "hvite bønner",
    "kidneybønner",
    "blandede bønner",
    "hermetiske bønner",
    "surkål",
    "gresskar",
  ],

  // === URTER ===
  Urter: [
    "basilikum",
    "frisk basilikum",
    "persille",
    "frisk persille",
    "flatbladpersille",
    "dill",
    "koriander",
    "fersk koriander",
    "gressløk",
    "mynte",
    "timian",
    "frisk timian",
    "rosmarin",
    "frisk rosmarin",
    "oregano",
    "salvie",
    "estragon",
    "sitronmelisse",
    "sitrongress",
    "laubærblad",
    "bladpersille",
  ],

  // === KRYDDER ===
  Krydder: [
    "salt",
    "havsalt",
    "flaksalt",
    "pepper",
    "sort pepper",
    "hvitpepper",
    "kvernet pepper",
    "kanel",
    "karri",
    "karripulver",
    "gurkemeie",
    "paprikapulver",
    "røkt paprika",
    "spisskummen",
    "koriander malt",
    "muskatnøtt",
    "kardemomme",
    "nellik",
    "ingefær",
    "frisk ingefær",
    "chilipulver",
    "chilifakes",
    "chiliflak",
    "cayennepepper",
    "allehånde",
    "fennikelfrø",
    "stjerneanis",
    "safran",
    "løkpulver",
    "hvitløkspulver",
    "timian tørket",
    "oregano tørket",
    "rosmarin tørket",
    "persille tørket",
    "krydderblanding",
    "tacokrydder",
    "tikka masala-krydder",
    "garam masala",
    "ras el hanout",
    "grønn karripasta",
    "rød karripasta",
    "tandoori",
    "za'atar",
    "sumak",
  ],

  // === TØRRVARER ===
  Tørrvarer: [
    "ris",
    "jasminris",
    "basmatris",
    "risottoris",
    "langkornet ris",
    "fullkornsris",
    "sushiris",
    "pasta",
    "spaghetti",
    "penne",
    "fusilli",
    "tagliatelle",
    "linguine",
    "farfalle",
    "makaroni",
    "rigatoni",
    "lasagneplater",
    "fullkornspasta",
    "nudler",
    "ramen",
    "glassnudler",
    "risnudler",
    "mel",
    "hvetemel",
    "sammalt hvetemel",
    "grovt mel",
    "rugmel",
    "maismel",
    "mandelmel",
    "kokosmel",
    "potetmel",
    "maisstivelse",
    "sukker",
    "brunt sukker",
    "melis",
    "muscovadosukker",
    "kokossukker",
    "havregryn",
    "lettkokte havregryn",
    "müsli",
    "granola",
    "cornflakes",
    "couscous",
    "quinoa",
    "bulgur",
    "linser",
    "røde linser",
    "grønne linser",
    "belugalinser",
    "kikerter",
    "tørkede kikerter",
    "pannekakemel",
    "pizzadeig",
    "panko",
    "brødsmuler",
  ],

  // === HERMETIKK ===
  Hermetikk: [
    "hermetiske tomater",
    "knuste tomater",
    "hele tomater",
    "tomatpuré",
    "tomatsaus",
    "kokosmelk",
    "kokosmjølk",
    "kokoskrem",
    "kikerter hermetisk",
    "bønner hermetisk",
    "mais hermetisk",
    "hermetisk mais",
    "kidneybønner hermetisk",
    "svarte bønner",
    "hvite bønner hermetisk",
    "linser hermetisk",
    "ananas hermetisk",
    "fersken hermetisk",
    "mandariner hermetisk",
    "bambuskudd",
    "vannkastanjer",
    "jalapeño hermetisk",
    "kapris",
    "pesto",
    "grønn pesto",
    "rød pesto",
    "tapenade",
    "ajvar",
  ],

  // === SAUSER OG TILBEHØR ===
  "Sauser og tilbehør": [
    "soyasaus",
    "lys soyasaus",
    "mørk soyasaus",
    "ketchup",
    "sennep",
    "grov sennep",
    "dijon sennep",
    "majones",
    "eddik",
    "hvitvinseddik",
    "eplecidereddik",
    "balsamicoeddik",
    "rødvinseddik",
    "riseddik",
    "sriracha",
    "tabasco",
    "søt chili saus",
    "hoisinsaus",
    "østerssaus",
    "fiskesaus",
    "teriyakisaus",
    "barbecuesaus",
    "HP-saus",
    "bearnaisesaus",
    "hollandaisesaus",
    "honning",
    "sirup",
    "lys sirup",
    "mørk sirup",
    "lønnesirup",
    "olivenolje",
    "extra virgin olivenolje",
    "rapsolje",
    "solsikkeolje",
    "sesamolje",
    "kokosolje",
    "trøffelolje",
    "olje",
    "worcestershiresaus",
    "sambal oelek",
    "hvit saus",
    "brun saus",
    "peppersaus",
    "salsa",
    "guacamole",
    "hummus",
    "tahini",
    "peanøttsmør",
  ],

  // === BAKST ===
  Bakst: [
    "bakepulver",
    "natron",
    "gjær",
    "tørrgjær",
    "ferskgjær",
    "kakaopulver",
    "kakao",
    "vaniljesukker",
    "vaniljeekstrakt",
    "vaniljestang",
    "sjokolade",
    "mørk sjokolade",
    "melkesjokolade",
    "hvit sjokolade",
    "sjokoladebiter",
    "kokosflak",
    "kokos revet",
    "marsipan",
    "gelatin",
    "gelatinblad",
    "kremtopping",
    "konditorfarge",
    "fondant",
    "melis",
    "flormelis",
    "cornflour",
    "mandelessens",
    "sitronskall",
    "appelsinskall",
  ],

  // === NØTTER OG FRØ ===
  "Nøtter og frø": [
    "mandler",
    "hele mandler",
    "hakkede mandler",
    "mandelflak",
    "valnøtter",
    "cashewnøtter",
    "hasselnøtter",
    "peanøtter",
    "pistasj",
    "pistasjnøtter",
    "pekannøtter",
    "macadamianøtter",
    "paranøtter",
    "pinjekjerner",
    "sesamfrø",
    "solsikkefrø",
    "gresskarfrø",
    "chiafrø",
    "linfrø",
    "hampfrø",
    "valmuefrø",
    "blandet nøttemiks",
  ],

  // === BRØD OG BAKERVARER ===
  "Brød og bakervarer": [
    "brød",
    "grovbrød",
    "loff",
    "kneippbrød",
    "ciabatta",
    "baguette",
    "rundstykker",
    "polarbrød",
    "knekkebrød",
    "flatbrød",
    "tortilla",
    "pitabrød",
    "naanbrød",
    "focaccia",
    "lompe",
    "lefse",
    "hamburgerbrød",
    "pølsebrød",
    "toast",
    "toastbrød",
    "rugbrød",
    "surdeig",
    "croissant",
    "boller",
    "kanelboller",
    "skillingsboller",
  ],

  // === DRIKKE ===
  Drikke: [
    "appelsinjuice",
    "eplejuice",
    "tomatjuice",
    "vin",
    "hvitvin",
    "rødvin",
    "øl",
    "sider",
    "tonic",
  ],

  // === DIVERSE / ANNET ===
  Diverse: [
    "tofu",
    "tempeh",
    "seitan",
    "grønnsakkraft",
    "kjøttkraft",
    "kyllingkraft",
    "fiskekraft",
    "buljong",
    "grønnsaksbuljong",
    "kyllingbuljong",
    "oksekraftbuljong",
    "syltetøy",
    "jordbærsyltetøy",
    "bringebærsyltetøy",
    "marmelade",
    "peanøttsmør",
    "nutella",
    "brunost",
    "kaviar på tube",
    "leverpostei",
    "makrell i tomat",
    "vann",
    "is",
    "kålstuing",
  ],
};

// ============================================================================
// Helper: classify a query result
// ============================================================================

type ResultType = "mapped" | "cleaned" | "skipped";

function classifyResult(
  original: string,
  result: string
): { type: ResultType; query: string } {
  if (result === "") {
    return { type: "skipped", query: "" };
  }
  // If the result differs from the cleaned/lowercased original, it was mapped
  const cleaned = original.toLowerCase().trim();
  if (result !== cleaned) {
    return { type: "mapped", query: result };
  }
  return { type: "cleaned", query: result };
}

// ============================================================================
// Tests
// ============================================================================

describe("Grocery simulator", () => {
  it("matprat ingredient coverage", () => {
    // Extract all unique ingredient names from matprat recipes
    const allIngredientNames = new Set<string>();
    for (const recipe of matpratRecipes) {
      for (const ing of recipe.ingredients) {
        allIngredientNames.add(ing.name.toLowerCase());
      }
    }

    const ingredientList = [...allIngredientNames].sort();
    const mapped: string[] = [];
    const unmapped: string[] = [];
    const skipped: string[] = [];

    for (const name of ingredientList) {
      const result = refineSearchQuery(name);
      const classification = classifyResult(name, result);
      switch (classification.type) {
        case "mapped":
          mapped.push(name);
          break;
        case "cleaned":
          unmapped.push(name);
          break;
        case "skipped":
          skipped.push(name);
          break;
      }
    }

    const total = ingredientList.length;
    const mappedRate = ((mapped.length / total) * 100).toFixed(1);

    console.log("\n=== MATPRAT INGREDIENT COVERAGE ===");
    console.log(`Total unique ingredients: ${total}`);
    console.log(`Mapped (has refinement):  ${mapped.length} (${mappedRate}%)`);
    console.log(`Unmapped (cleaned name):  ${unmapped.length}`);
    console.log(`Skipped (empty):          ${skipped.length}`);

    if (unmapped.length > 0) {
      console.log("\nUnmapped matprat ingredients (need refinements):");
      for (const name of unmapped) {
        const result = refineSearchQuery(name);
        console.log(`  "${name}" → search: "${result}"`);
      }
    }

    if (skipped.length > 0) {
      console.log("\nSkipped matprat ingredients:");
      for (const name of skipped) {
        console.log(`  "${name}"`);
      }
    }

    // We expect at least some coverage
    expect(mapped.length).toBeGreaterThan(0);
    expect(total).toBeGreaterThan(0);
  });

  it("common Norwegian groceries coverage", () => {
    const allItems: { name: string; category: string }[] = [];
    for (const [category, items] of Object.entries(norwegianGroceries)) {
      for (const item of items) {
        allItems.push({ name: item, category });
      }
    }

    const mapped: { name: string; category: string; query: string }[] = [];
    const unmapped: { name: string; category: string; query: string }[] = [];
    const skipped: { name: string; category: string }[] = [];

    for (const { name, category } of allItems) {
      const result = refineSearchQuery(name);
      const classification = classifyResult(name, result);
      switch (classification.type) {
        case "mapped":
          mapped.push({ name, category, query: classification.query });
          break;
        case "cleaned":
          unmapped.push({ name, category, query: classification.query });
          break;
        case "skipped":
          skipped.push({ name, category });
          break;
      }
    }

    const total = allItems.length;
    const mappedRate = ((mapped.length / total) * 100).toFixed(1);
    const unmappedRate = ((unmapped.length / total) * 100).toFixed(1);

    console.log("\n=== COMMON NORWEGIAN GROCERIES COVERAGE ===");
    console.log(`Total items:              ${total}`);
    console.log(
      `Mapped (has refinement):  ${mapped.length} (${mappedRate}%)`
    );
    console.log(
      `Unmapped (cleaned name):  ${unmapped.length} (${unmappedRate}%)`
    );
    console.log(`Skipped (empty):          ${skipped.length}`);

    // Group unmapped by category
    if (unmapped.length > 0) {
      console.log("\n--- Unmapped items by category ---");
      const byCategory: Record<
        string,
        { name: string; query: string }[]
      > = {};
      for (const item of unmapped) {
        if (!byCategory[item.category]) {
          byCategory[item.category] = [];
        }
        byCategory[item.category].push({
          name: item.name,
          query: item.query,
        });
      }
      for (const [category, items] of Object.entries(byCategory)) {
        console.log(`\n  ${category} (${items.length} unmapped):`);
        for (const item of items) {
          console.log(`    "${item.name}" → search: "${item.query}"`);
        }
      }
    }

    if (skipped.length > 0) {
      console.log("\nSkipped items:");
      for (const item of skipped) {
        console.log(`  "${item.name}" (${item.category})`);
      }
    }

    // We expect the list to have a reasonable size
    expect(total).toBeGreaterThanOrEqual(500);
    expect(mapped.length).toBeGreaterThan(0);
  });

  it("overall coverage rate", () => {
    // Combine matprat + groceries
    const allNames = new Set<string>();

    // Add matprat ingredients
    for (const recipe of matpratRecipes) {
      for (const ing of recipe.ingredients) {
        allNames.add(ing.name.toLowerCase());
      }
    }

    // Add grocery list
    for (const items of Object.values(norwegianGroceries)) {
      for (const item of items) {
        allNames.add(item.toLowerCase());
      }
    }

    const allList = [...allNames].sort();
    let mappedCount = 0;
    let unmappedCount = 0;
    let skippedCount = 0;

    for (const name of allList) {
      const result = refineSearchQuery(name);
      const classification = classifyResult(name, result);
      switch (classification.type) {
        case "mapped":
          mappedCount++;
          break;
        case "cleaned":
          unmappedCount++;
          break;
        case "skipped":
          skippedCount++;
          break;
      }
    }

    const total = allList.length;
    const coverageRate = ((mappedCount / total) * 100).toFixed(1);

    console.log("\n=== OVERALL COVERAGE (combined) ===");
    console.log(`Total unique items:       ${total}`);
    console.log(
      `Mapped (has refinement):  ${mappedCount} (${coverageRate}%)`
    );
    console.log(`Unmapped (cleaned name):  ${unmappedCount}`);
    console.log(`Skipped (empty):          ${skippedCount}`);
    console.log(
      `\nCoverage rate: ${coverageRate}% of items have a specific search refinement.`
    );

    // Expect at least 25% coverage as a baseline — this will increase as we add refinements
    const coverageNumber = (mappedCount / total) * 100;
    expect(coverageNumber).toBeGreaterThanOrEqual(25);
  });
});
