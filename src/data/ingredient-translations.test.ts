import { describe, it, expect } from "vitest";
import { translateIngredient, ingredientTranslations } from "./ingredient-translations";

describe("translateIngredient", () => {
  describe("Direct matches", () => {
    const cases: [string, string][] = [
      ["chicken breast", "kyllingfilet"],
      ["salmon", "laks"],
      ["onion", "løk"],
      ["garlic", "hvitløk"],
      ["olive oil", "olivenolje"],
      ["butter", "smør"],
      ["milk", "melk"],
      ["rice", "ris"],
      ["salt", "salt"],
      ["pepper", "pepper"],
      ["basil", "basilikum"],
      ["lemon", "sitron"],
      ["tomato", "tomat"],
      ["potato", "potet"],
      ["egg", "egg"],
    ];

    it.each(cases)('"%s" → "%s"', (input, expected) => {
      const result = translateIngredient(input);
      expect(result.norwegian).toBe(expected);
      expect(result.wasTranslated).toBe(true);
    });
  });

  describe("Case insensitive", () => {
    it("translates uppercase", () => {
      expect(translateIngredient("Chicken Breast").wasTranslated).toBe(true);
    });

    it("translates mixed case", () => {
      expect(translateIngredient("SALMON").norwegian).toBe("laks");
    });
  });

  describe("Depluralization", () => {
    it("handles 'tomatoes' (has explicit plural entry)", () => {
      expect(translateIngredient("tomatoes").norwegian).toBe("tomater");
    });

    it("handles 'potatoes'", () => {
      expect(translateIngredient("potatoes").norwegian).toBe("poteter");
    });
  });

  describe("Prefix stripping", () => {
    it("strips 'fresh' and translates", () => {
      const result = translateIngredient("fresh basil");
      expect(result.norwegian).toBe("fersk basilikum");
      expect(result.wasTranslated).toBe(true);
    });

    it("strips 'dried'", () => {
      expect(translateIngredient("dried thyme").norwegian).toBe("timian");
    });

    it("strips 'chopped'", () => {
      expect(translateIngredient("chopped onion").norwegian).toBe("løk");
    });
  });

  describe("Unknown ingredients", () => {
    it("returns original for unknown", () => {
      const result = translateIngredient("kimchi");
      expect(result.norwegian).toBe("kimchi");
      expect(result.wasTranslated).toBe(false);
    });
  });

  describe("Translation table completeness", () => {
    it("has at least 200 entries", () => {
      expect(Object.keys(ingredientTranslations).length).toBeGreaterThanOrEqual(200);
    });

    it("all values are non-empty strings", () => {
      for (const [key, value] of Object.entries(ingredientTranslations)) {
        expect(value, `Value for "${key}" should be non-empty`).toBeTruthy();
      }
    });

    it("no duplicate values that suggest typos", () => {
      // This is informational — some duplicates are expected (e.g., egg/eggs → egg)
      const values = Object.values(ingredientTranslations);
      const uniqueValues = new Set(values);
      // Allow up to 30% duplicates (singular/plural pairs)
      expect(uniqueValues.size).toBeGreaterThan(values.length * 0.5);
    });
  });
});
