import { describe, it, expect } from "vitest";
import { refineSearchQuery } from "./search-refinements";

describe("refineSearchQuery", () => {
  describe("Norwegian ingredients — exact match", () => {
    const cases: [string, string][] = [
      ["melk", "helmelk tine"],
      ["smør", "meierismør tine"],
      ["fløte", "matfløte tine"],
      ["ost", "norvegia ost"],
      ["egg", "egg frittgående"],
      ["laks", "laksefilet fersk"],
      ["torsk", "torskefilet fersk"],
      ["kylling", "kyllingfilet prior"],
      ["kjøttdeig", "kjøttdeig gilde"],
      ["salt", "jodsalt"],
      ["pepper", "sort pepper kvern"],
      ["løk", "gul løk"],
      ["hvitløk", "hvitløk"],
      ["gulrot", "gulrøtter pose"],
      ["ris", "jasminris"],
      ["pasta", "spaghetti barilla"],
      ["olivenolje", "olivenolje extra virgin"],
      ["sukker", "sukker dansukker"],
      ["mel", "hvetemel"],
    ];

    it.each(cases)('"%s" → "%s"', (input, expected) => {
      expect(refineSearchQuery(input)).toBe(expected);
    });
  });

  describe("English ingredients — from Spoonacular", () => {
    const cases: [string, string][] = [
      ["chicken breast", "kyllingfilet prior"],
      ["salmon", "laksefilet fersk"],
      ["ground beef", "kjøttdeig gilde"],
      ["olive oil", "olivenolje extra virgin"],
      ["greek yogurt", "gresk yoghurt"],
      ["nonfat greek yogurt", "gresk yoghurt"],
      ["soy sauce", "soyasaus kikkoman"],
      ["flaky fish", "torskefilet fersk"],
      ["jalapeno", "chili jalapeño"],
      ["cilantro", "koriander fersk"],
      ["bell pepper", "paprika rød fersk"],
      ["garlic", "hvitløk"],
      ["lemon juice", "sitronsaft"],
      ["lime juice", "limesaft"],
      ["coconut milk", "kokosmelk"],
    ];

    it.each(cases)('"%s" → "%s"', (input, expected) => {
      expect(refineSearchQuery(input)).toBe(expected);
    });
  });

  describe("Strips units and numbers before matching", () => {
    const cases: [string, string][] = [
      ["1 klype salt", "jodsalt"],
      ["2 fedd hvitløk", "hvitløk"],
      ["3 dl melk", "helmelk tine"],
      ["400 g laks", "laksefilet fersk"],
      ["2 ss olivenolje", "olivenolje extra virgin"],
      ["1 stk løk", "gul løk"],
      ["2 tbsps coriander", "koriander fersk"],
      ["4 servings salt and pepper", ""],
      ["1 large onion", "gul løk"],
      ["2 cups flour", "hvetemel regal"],
      ["1 can tomatoes", "tomater løsvekt"],
    ];

    it.each(cases)('"%s" → "%s"', (input, expected) => {
      expect(refineSearchQuery(input)).toBe(expected);
    });
  });

  describe("Skip items", () => {
    it("skips vann (water)", () => {
      expect(refineSearchQuery("vann")).toBe("");
    });

    it("skips salt and pepper", () => {
      expect(refineSearchQuery("salt and pepper")).toBe("");
    });

    it("skips salt og pepper", () => {
      expect(refineSearchQuery("salt og pepper")).toBe("");
    });
  });

  describe("Fallback — returns cleaned name", () => {
    it("returns cleaned name for unknown ingredients", () => {
      const result = refineSearchQuery("kimchi");
      expect(result).toBe("kimchi");
    });

    it("strips units from unknown ingredients", () => {
      const result = refineSearchQuery("200 g tempeh");
      expect(result).toBe("tempeh");
    });
  });
});
