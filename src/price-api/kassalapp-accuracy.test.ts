import { describe, it, expect } from "vitest";
import { refineSearchQuery } from "./search-refinements";

/**
 * Test that common Norwegian ingredients produce good search queries.
 * A "good" query means:
 * 1. It's not empty (ingredient should be searchable)
 * 2. It doesn't contain the raw ingredient name when a better refinement exists
 * 3. It avoids terms that return baby food, desserts, snacks
 */

const COMMON_INGREDIENTS = [
  // Grønnsaker
  "agurk", "tomat", "løk", "hvitløk", "gulrot", "brokkoli", "paprika",
  "spinat", "babyspinat", "salat", "sopp", "squash", "blomkål", "mais",
  "erter", "sukkererter", "avokado", "aubergine", "selleri", "purre",
  // Frukt
  "sitron", "lime", "eple", "banan", "mango", "appelsin", "ananas",
  // Protein
  "laks", "torsk", "kveite", "reker", "kylling", "kjøttdeig", "egg",
  "tofu", "edamame", "kikerter", "linser",
  // Meieri
  "melk", "smør", "fløte", "rømme", "ost", "yoghurt",
  // Tørrvarer
  "ris", "pasta", "mel", "havregryn", "brød",
  // Krydder
  "salt", "pepper", "hvitløk", "ingefær", "kanel",
  // Olje
  "olivenolje",
];

describe("Kassalapp search accuracy", () => {
  describe("All common ingredients produce a non-empty query", () => {
    for (const ing of COMMON_INGREDIENTS) {
      it(`"${ing}" produces a query`, () => {
        const query = refineSearchQuery(ing);
        expect(query, `"${ing}" should produce a non-empty query`).toBeTruthy();
      });
    }
  });

  describe("Queries should NOT contain problematic generic terms", () => {
    const problematic = COMMON_INGREDIENTS.filter(ing => {
      const query = refineSearchQuery(ing);
      // These exact terms return baby food or desserts on Kassalapp
      return query === ing && ["agurk", "mango", "sitron", "lime", "ris", "pasta", "mais"].includes(ing);
    });

    it("problematic generic terms should have refinements", () => {
      if (problematic.length > 0) {
        console.log("Missing refinements for:", problematic);
      }
      // Allow max 2 unrefined problematic terms
      expect(problematic.length).toBeLessThanOrEqual(2);
    });
  });

  describe("Specific refinements produce good queries", () => {
    const expected: [string, string][] = [
      ["agurk", "agurk fersk løsvekt"],
      ["mango", "mango fersk"],
      ["sitron", "sitron løsvekt"],
      ["lime", "lime løsvekt"],
      ["babyspinat", "babyspinat"],
      ["edamame", "edamame frossen"],
      ["sukkererter", "sukkererter friske"],
      ["kveite", "kveitefilet"],
    ];

    for (const [input, expected_query] of expected) {
      it(`"${input}" → "${expected_query}"`, () => {
        const query = refineSearchQuery(input);
        expect(query).toBe(expected_query);
      });
    }
  });

  describe("Overall accuracy: at least 60% of ingredients have refinements", () => {
    it("60%+ of common ingredients have specific refinements (not just passthrough)", () => {
      let refined = 0;
      let passthrough = 0;

      for (const ing of COMMON_INGREDIENTS) {
        const query = refineSearchQuery(ing);
        if (query !== ing && query !== "") {
          refined++;
        } else {
          passthrough++;
        }
      }

      const rate = refined / COMMON_INGREDIENTS.length;
      console.log(`Refined: ${refined}/${COMMON_INGREDIENTS.length} (${Math.round(rate * 100)}%)`);
      console.log(`Passthrough (no refinement): ${passthrough}`);

      const passthroughList = COMMON_INGREDIENTS.filter(ing => {
        const query = refineSearchQuery(ing);
        return query === ing;
      });
      if (passthroughList.length > 0) {
        console.log("Passthrough ingredients:", passthroughList);
      }

      expect(rate).toBeGreaterThanOrEqual(0.6);
    });
  });
});
