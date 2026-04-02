import { describe, it, expect } from "vitest";
import { calculateEightADay } from "./eight-a-day";

describe("calculateEightADay", () => {
  it("counts vegetable servings (100g = 1 serving)", () => {
    const result = calculateEightADay([
      { category: "groennsaker", quantityGrams: 300 },
    ]);
    expect(result.fruitVegServings).toBe(3);
  });

  it("counts fruit servings", () => {
    const result = calculateEightADay([
      { category: "frukt", quantityGrams: 200 },
    ]);
    expect(result.fruitVegServings).toBe(2);
  });

  it("counts berries as fruit/veg", () => {
    const result = calculateEightADay([
      { category: "baer", quantityGrams: 100 },
    ]);
    expect(result.fruitVegServings).toBe(1);
  });

  it("counts whole grain servings (40g = 1 serving)", () => {
    const result = calculateEightADay([
      { category: "fullkorn", quantityGrams: 120 },
    ]);
    expect(result.wholeGrainServings).toBe(3);
  });

  it("does NOT count potatoes as vegetable servings", () => {
    const result = calculateEightADay([
      { category: "poteter", quantityGrams: 500 },
    ]);
    expect(result.fruitVegServings).toBe(0);
  });

  it("caps juice at 1 serving", () => {
    const result = calculateEightADay([
      { category: "frukt", quantityGrams: 0, isJuice: true },
    ]);
    expect(result.fruitVegServings).toBe(1);
  });

  it("combines fruit/veg + whole grain for total", () => {
    const result = calculateEightADay([
      { category: "groennsaker", quantityGrams: 300 }, // 3 servings
      { category: "frukt", quantityGrams: 200 },       // 2 servings
      { category: "fullkorn", quantityGrams: 120 },     // 3 servings
    ]);
    expect(result.fruitVegServings).toBe(5);
    expect(result.wholeGrainServings).toBe(3);
    expect(result.totalServings).toBe(8);
    expect(result.percentage).toBe(100);
  });

  it("caps fruit/veg at 5 for total calculation", () => {
    const result = calculateEightADay([
      { category: "groennsaker", quantityGrams: 800 }, // 8 servings, capped at 5
    ]);
    expect(result.fruitVegServings).toBe(8); // raw count
    expect(result.totalServings).toBe(5); // capped
  });

  it("handles empty list", () => {
    const result = calculateEightADay([]);
    expect(result.totalServings).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("does not count meat/fish", () => {
    const result = calculateEightADay([
      { category: "kjoett", quantityGrams: 500 },
      { category: "fisk", quantityGrams: 300 },
    ]);
    expect(result.totalServings).toBe(0);
  });

  it("counts whole grain bread/rice when marked", () => {
    const result = calculateEightADay([
      { category: "broed", quantityGrams: 80, isWholeGrain: true },
    ]);
    expect(result.wholeGrainServings).toBe(2);
  });

  it("does NOT count non-whole grain bread", () => {
    const result = calculateEightADay([
      { category: "broed", quantityGrams: 80, isWholeGrain: false },
    ]);
    expect(result.wholeGrainServings).toBe(0);
  });
});
