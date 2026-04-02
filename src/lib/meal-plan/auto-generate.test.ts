import { describe, it, expect } from "vitest";
import { generateWeekPlan } from "./auto-generate";

const mockRecipes = [
  { id: 1, name: "Laksemiddag", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 30 },
  { id: 2, name: "Torskefilet", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 25 },
  { id: 3, name: "Kyllingwok", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Asiatisk", prepTimeMinutes: 20 },
  { id: 4, name: "Pasta Bolognese", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Italiensk", prepTimeMinutes: 40 },
  { id: 5, name: "Vegetar Curry", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Indisk", prepTimeMinutes: 35 },
  { id: 6, name: "Tacofredag", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Meksikansk", prepTimeMinutes: 30 },
  { id: 7, name: "Grønnsakswok", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Asiatisk", prepTimeMinutes: 20 },
  { id: 8, name: "Fiskekaker", isFishMeal: true, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 20 },
  { id: 9, name: "Linsesuppe", isFishMeal: false, isVegetarian: true, isVegan: true, cuisine: "Indisk", prepTimeMinutes: 25 },
  { id: 10, name: "Kjøttdeiggryte", isFishMeal: false, isVegetarian: false, isVegan: false, cuisine: "Norsk", prepTimeMinutes: 45 },
];

describe("generateWeekPlan", () => {
  it("generates 7 meals", () => {
    const plan = generateWeekPlan(mockRecipes, "all");
    expect(plan.meals).toHaveLength(7);
  });

  it("includes 2 fish meals by default", () => {
    const plan = generateWeekPlan(mockRecipes, "all", 2);
    expect(plan.fishCount).toBeGreaterThanOrEqual(2);
  });

  it("each meal has a different day (0-6)", () => {
    const plan = generateWeekPlan(mockRecipes, "all");
    const days = plan.meals.map((m) => m.dayIndex);
    expect(new Set(days).size).toBe(7);
    expect(days.every((d) => d >= 0 && d < 7)).toBe(true);
  });

  it("prefers unique recipes", () => {
    const plan = generateWeekPlan(mockRecipes, "all");
    const ids = plan.meals.map((m) => m.recipe.id);
    // With 10 recipes, 7 should be unique
    expect(new Set(ids).size).toBe(7);
  });

  it("vegetarian diet excludes meat and fish", () => {
    const plan = generateWeekPlan(mockRecipes, "vegetarian");
    expect(plan.meals.every((m) => m.recipe.isVegetarian)).toBe(true);
    expect(plan.fishCount).toBe(0);
  });

  it("vegan diet only includes vegan recipes", () => {
    const plan = generateWeekPlan(mockRecipes, "vegan");
    expect(plan.meals.every((m) => m.recipe.isVegan)).toBe(true);
  });

  it("pescetarian includes fish but no meat", () => {
    const plan = generateWeekPlan(mockRecipes, "pescetarian");
    expect(plan.meals.every((m) => m.recipe.isVegetarian || m.recipe.isFishMeal)).toBe(true);
    expect(plan.fishCount).toBeGreaterThanOrEqual(1);
  });

  it("warns when no recipes match diet", () => {
    const plan = generateWeekPlan([], "all");
    expect(plan.meals).toHaveLength(0);
    expect(plan.warnings.length).toBeGreaterThan(0);
  });

  it("warns when few fish recipes available", () => {
    const fewFish = mockRecipes.filter((r) => !r.isFishMeal || r.id === 1);
    const plan = generateWeekPlan(fewFish, "all", 3);
    // Only 1 fish recipe, asked for 3
    expect(plan.warnings.some((w) => w.includes("fiskeoppskrift"))).toBe(true);
  });

  it("handles repeats gracefully with few recipes", () => {
    const few = mockRecipes.slice(0, 3);
    const plan = generateWeekPlan(few, "all");
    expect(plan.meals).toHaveLength(7); // Still generates 7, with repeats
    expect(plan.warnings.some((w) => w.includes("gjentas"))).toBe(true);
  });
});
