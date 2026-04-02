import { describe, it, expect } from "vitest";
import { refineSearchQuery } from "./search-refinements";

/**
 * End-to-end pipeline test: ingredient name → search query
 * Tests common Norwegian grocery items that users actually buy.
 */

const COMMON_GROCERY_ITEMS: [string, string | null][] = [
  // Tørrvarer
  ["hvetemel", "hvetemel regal"], // has refinement: hvetemel → hvetemel regal
  ["mel", "hvetemel"],           // refinement: mel → hvetemel
  ["sukker", "sukker dansukker"],
  ["ris", "jasminris"],
  ["pasta", "spaghetti barilla"],
  ["havregryn", "havregryn lettkokt"],

  // Meieri
  ["melk", "helmelk tine"],
  ["smør", "meierismør tine"],
  ["egg", "egg frittgående"],
  ["fløte", "matfløte tine"],
  ["rømme", "lettrømme tine"],

  // Frukt (verified against Kassalapp API)
  ["sitron", "sitroner"],
  ["lime", "lime pr stk"],
  ["avokado", "avokado stk"],
  ["mango", "mango stk"],
  ["banan", "bananer bama"],
  ["eple", "epler pose"],

  // Grønnsaker
  ["løk", "gul løk"],
  ["hvitløk", "hvitløk"],
  ["gulrot", "gulrøtter pose"],
  ["brokkoli", "brokkoli stk"],
  ["tomat", "tomater"],
  ["agurk", "agurk norsk"],
  ["paprika", "paprika rød"],
  ["spinat", "babyspinat"],

  // Kjøtt
  ["kylling", "kyllingfilet prior"],
  ["kjøttdeig", "kjøttdeig gilde"],
  ["bacon", "bacon gilde"],

  // Fisk
  ["laks", "laksefilet fersk"],
  ["torsk", "torskefilet fersk"],
  ["reker", "reker pillede"],

  // Krydder
  ["salt", "jodsalt"],
  ["pepper", "sort pepper kvern"],
  ["kanel", "kanel malt"],
  ["olivenolje", "olivenolje extra virgin"],
  ["soyasaus", "soyasaus kikkoman"],

  // Hermetikk
  ["hermetiske tomater", "hermetiske tomater"],
  ["kokosmelk", "kokosmelk"],
];

describe("Pipeline: ingredient → Kassalapp query", () => {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const [input, expectedQuery] of COMMON_GROCERY_ITEMS) {
    it(`"${input}" → "${expectedQuery}"`, () => {
      const query = refineSearchQuery(input);
      if (query === expectedQuery) {
        passed++;
      } else {
        failed++;
        failures.push(`"${input}": expected "${expectedQuery}", got "${query}"`);
      }
      expect(query).toBe(expectedQuery);
    });
  }

  it("overall success rate ≥ 80%", () => {
    let p = 0;
    for (const [input, expected] of COMMON_GROCERY_ITEMS) {
      if (refineSearchQuery(input) === expected) p++;
    }
    const rate = p / COMMON_GROCERY_ITEMS.length;
    console.log(`Pipeline accuracy: ${p}/${COMMON_GROCERY_ITEMS.length} (${Math.round(rate * 100)}%)`);
    expect(rate).toBeGreaterThanOrEqual(0.8);
  });
});

describe("Pipeline: no query produces empty for real ingredients", () => {
  const realIngredients = [
    "hvetemel", "smør", "egg", "melk", "løk", "hvitløk", "gulrot",
    "laks", "torsk", "kylling", "bacon", "ris", "pasta", "salt",
    "pepper", "olivenolje", "tomat", "sitron", "lime", "avokado",
  ];

  for (const ing of realIngredients) {
    it(`"${ing}" produces non-empty query`, () => {
      const query = refineSearchQuery(ing);
      expect(query, `"${ing}" should not be empty`).toBeTruthy();
      expect(query.length).toBeGreaterThan(1);
    });
  }
});
