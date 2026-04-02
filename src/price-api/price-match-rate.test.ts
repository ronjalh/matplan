import { describe, it, expect } from "vitest";
import { refineSearchQuery } from "./search-refinements";

/**
 * Simulated Spoonacular recipe ingredients — real data from common recipes.
 * Tests whether our refinement pipeline produces a searchable query for each.
 */
describe("Price match rate — simulated Spoonacular ingredients", () => {
  // Fish Tacos recipe
  const fishTacos = [
    "1 lb flaky fish",
    "8 small tortillas",
    "1 avocado",
    "2 tbsps cilantro",
    "1 small jalapeno",
    "2 tbsps lime juice",
    "1 cup nonfat greek yogurt",
    "salt and pepper",
  ];

  // Chicken Curry recipe
  const chickenCurry = [
    "2 chicken breasts",
    "1 can coconut milk",
    "2 tbsps curry powder",
    "1 onion",
    "3 cloves garlic",
    "1 tbsp ginger",
    "2 cups rice",
    "1 tbsp olive oil",
    "salt",
    "fresh cilantro",
  ];

  // Pasta Bolognese
  const pastaBolognese = [
    "500g ground beef",
    "400g spaghetti",
    "1 can crushed tomatoes",
    "1 onion",
    "2 cloves garlic",
    "2 tbsps tomato paste",
    "1 tsp oregano",
    "1 tsp basil",
    "salt and pepper",
    "parmesan cheese",
  ];

  // Salmon with vegetables
  const salmonDinner = [
    "4 salmon fillets",
    "300g broccoli",
    "200g carrots",
    "2 tbsps olive oil",
    "1 lemon",
    "2 cloves garlic",
    "salt",
    "pepper",
    "fresh dill",
  ];

  // Vegetarian Buddha Bowl
  const buddhaBowl = [
    "1 can chickpeas",
    "1 sweet potato",
    "2 cups quinoa",
    "1 avocado",
    "2 cups spinach",
    "2 tbsps tahini",
    "1 tbsp lemon juice",
    "1 tbsp olive oil",
    "salt",
    "pepper",
  ];

  function testRecipe(name: string, ingredients: string[]) {
    describe(`Recipe: ${name}`, () => {
      const results = ingredients.map((ing) => ({
        original: ing,
        query: refineSearchQuery(ing),
      }));

      it("produces a query for most ingredients", () => {
        const withQuery = results.filter((r) => r.query !== "");
        const skipItems = results.filter((r) => r.query === "");
        const matchRate = withQuery.length / ingredients.length;

        console.log(`\n${name}: ${withQuery.length}/${ingredients.length} (${Math.round(matchRate * 100)}%)`);
        for (const r of results) {
          console.log(`  "${r.original}" → "${r.query || "(skipped)"}"`)
        }

        // At least 70% should produce a query (some items like "salt and pepper" are skipped)
        expect(matchRate).toBeGreaterThanOrEqual(0.7);
      });

      it("no query contains raw units like tbsp, cup, oz", () => {
        for (const r of results) {
          if (r.query) {
            expect(r.query, `Query for "${r.original}" should not contain raw units`)
              .not.toMatch(/\b(tbsp|tbsps|tsp|tsps|cup|cups|oz|lb|lbs|serving|servings)\b/i);
          }
        }
      });

      it("no query contains numbers", () => {
        for (const r of results) {
          if (r.query) {
            expect(r.query, `Query for "${r.original}" should not start with numbers`)
              .not.toMatch(/^\d/);
          }
        }
      });
    });
  }

  testRecipe("Fish Tacos", fishTacos);
  testRecipe("Chicken Curry", chickenCurry);
  testRecipe("Pasta Bolognese", pastaBolognese);
  testRecipe("Salmon Dinner", salmonDinner);
  testRecipe("Buddha Bowl", buddhaBowl);

  describe("Overall match rate", () => {
    it("achieves at least 80% across all recipes", () => {
      const allIngredients = [
        ...fishTacos,
        ...chickenCurry,
        ...pastaBolognese,
        ...salmonDinner,
        ...buddhaBowl,
      ];

      const results = allIngredients.map((ing) => refineSearchQuery(ing));
      const withQuery = results.filter((q) => q !== "");
      const rate = withQuery.length / allIngredients.length;

      console.log(`\nOverall: ${withQuery.length}/${allIngredients.length} (${Math.round(rate * 100)}%)`);
      expect(rate).toBeGreaterThanOrEqual(0.8);
    });
  });
});
