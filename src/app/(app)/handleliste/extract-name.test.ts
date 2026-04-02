import { describe, it, expect } from "vitest";

// Replicate extractIngredientName for testing
function extractIngredientName(text: string, quantity?: number, unit?: string): string {
  if (!text) return "";

  let cleaned = text
    .replace(/^ca\.?\s*/i, "")
    .replace(/^[\d.,]+\s*/g, "")
    .replace(/^(g|kg|dl|l|ml|ss|ts|stk|pk|fedd|klype|bunt|kvast|porsjon|neve|blad|skive|bx|glass|båter?|boks|pose|tbsps?|tsps?|cups?|oz|lbs?|servings?|tablespoons?|teaspoons?|pinch|dash|small|medium|large|handful|cans?|pieces?|whole|slices?|sprigs?|cloves?|bunch|packet|package)\.?\s+/i, "")
    .replace(/^[\d.,]+\s*/g, "")
    .replace(/^(g|kg|dl|l|ml|ss|ts|stk|pk|fedd|klype|båter?|boks|pose|tbsps?|tsps?|cups?|oz|lbs?|servings?|tablespoons?|teaspoons?|small|medium|large)\.?\s+/i, "")
    .trim();

  if (!cleaned) cleaned = text;

  cleaned = cleaned
    .replace(/,?\s*(to taste|for garnish|for serving|as needed|optional)\s*$/i, "")
    .trim();

  return cleaned || text;
}

describe("extractIngredientName", () => {
  describe("Matprat format — stk. with period", () => {
    it("'1 stk. løk' → 'løk'", () => {
      expect(extractIngredientName("1 stk. løk")).toBe("løk");
    });

    it("'1 stk. hakket løk' → 'hakket løk'", () => {
      expect(extractIngredientName("1 stk. hakket løk")).toBe("hakket løk");
    });

    it("'2 stk. gulrot' → 'gulrot'", () => {
      expect(extractIngredientName("2 stk. gulrot")).toBe("gulrot");
    });

    it("'1 stk. jalapeño' → 'jalapeño' (NOT 'stk. jalapeño')", () => {
      expect(extractIngredientName("1 stk. jalapeño")).toBe("jalapeño");
    });

    it("'2 stk. lime' → 'lime'", () => {
      expect(extractIngredientName("2 stk. lime")).toBe("lime");
    });
  });

  describe("Matprat format — other units with period", () => {
    it("'2 båter hvitløk' → 'hvitløk'", () => {
      expect(extractIngredientName("2 båter hvitløk")).toBe("hvitløk");
    });

    it("'1 boks hermetiske tomater' → 'hermetiske tomater'", () => {
      expect(extractIngredientName("1 boks hermetiske tomater")).toBe("hermetiske tomater");
    });

    it("'1 pose tacokrydder' → 'tacokrydder'", () => {
      expect(extractIngredientName("1 pose tacokrydder")).toBe("tacokrydder");
    });
  });

  describe("Standard format", () => {
    it("'400 g laks' → 'laks'", () => {
      expect(extractIngredientName("400 g laks")).toBe("laks");
    });

    it("'2 ss olivenolje' → 'olivenolje'", () => {
      expect(extractIngredientName("2 ss olivenolje")).toBe("olivenolje");
    });

    it("'3 dl vann' → 'vann'", () => {
      expect(extractIngredientName("3 dl vann")).toBe("vann");
    });

    it("'1,5 kg potet' → 'potet'", () => {
      expect(extractIngredientName("1,5 kg potet")).toBe("potet");
    });
  });

  describe("English format", () => {
    it("'2 tbsps olive oil' → 'olive oil'", () => {
      expect(extractIngredientName("2 tbsps olive oil")).toBe("olive oil");
    });

    it("'1 cup flour' → 'flour'", () => {
      expect(extractIngredientName("1 cup flour")).toBe("flour");
    });
  });

  describe("Compound/double units", () => {
    it("'ca. 2,5 dl chicken broth' → 'chicken broth'", () => {
      expect(extractIngredientName("ca. 2,5 dl chicken broth")).toBe("chicken broth");
    });

    it("'4 tbsps 2 tbsps koriander' → 'koriander'", () => {
      expect(extractIngredientName("4 tbsps 2 tbsps koriander")).toBe("koriander");
    });
  });

  describe("No quantity", () => {
    it("'salt og pepper' → 'salt og pepper'", () => {
      expect(extractIngredientName("salt og pepper")).toBe("salt og pepper");
    });
  });
});
