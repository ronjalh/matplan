import { describe, it, expect } from "vitest";
import { calculatePlateModel } from "./plate-model";

describe("calculatePlateModel", () => {
  it("returns balanced for equal thirds", () => {
    const result = calculatePlateModel([
      { category: "groennsaker", quantityGrams: 200 },
      { category: "poteter", quantityGrams: 200 },
      { category: "fisk", quantityGrams: 200 },
    ]);
    expect(result.assessment).toBe("balanced");
    expect(result.vegetable).toBeCloseTo(0.33, 1);
    expect(result.carbohydrate).toBeCloseTo(0.33, 1);
    expect(result.protein).toBeCloseTo(0.33, 1);
  });

  it("returns unbalanced when one category dominates", () => {
    const result = calculatePlateModel([
      { category: "kjoett", quantityGrams: 500 },
    ]);
    expect(result.assessment).toBe("unbalanced");
    expect(result.protein).toBe(1.0);
  });

  it("returns slightly-off when close but not balanced", () => {
    const result = calculatePlateModel([
      { category: "groennsaker", quantityGrams: 150 },
      { category: "ris_pasta", quantityGrams: 250 },
      { category: "kjoett", quantityGrams: 200 },
    ]);
    // veg: 150/600 = 0.25, carb: 250/600 = 0.42, prot: 200/600 = 0.33
    expect(result.assessment).toBe("slightly-off");
  });

  it("handles empty ingredient list", () => {
    const result = calculatePlateModel([]);
    expect(result.vegetable).toBe(0);
    expect(result.carbohydrate).toBe(0);
    expect(result.protein).toBe(0);
    expect(result.assessment).toBe("unbalanced");
  });

  it("scores sum to 1.0", () => {
    const result = calculatePlateModel([
      { category: "groennsaker", quantityGrams: 150 },
      { category: "poteter", quantityGrams: 200 },
      { category: "fisk", quantityGrams: 180 },
    ]);
    const sum = result.vegetable + result.carbohydrate + result.protein;
    expect(sum).toBeCloseTo(1.0, 2);
  });

  it("classifies fruit as vegetable in plate model", () => {
    const result = calculatePlateModel([
      { category: "frukt", quantityGrams: 300 },
      { category: "ris_pasta", quantityGrams: 300 },
      { category: "egg", quantityGrams: 300 },
    ]);
    expect(result.vegetable).toBeCloseTo(0.33, 1);
  });

  it("classifies 'other' categories as not counted", () => {
    const result = calculatePlateModel([
      { category: "groennsaker", quantityGrams: 200 },
      { category: "fett_olje", quantityGrams: 50 }, // "other" — not counted
      { category: "kjoett", quantityGrams: 200 },
    ]);
    // Only veg + protein = 400g total, oil is excluded
    expect(result.vegetable).toBeCloseTo(0.5, 1);
    expect(result.protein).toBeCloseTo(0.5, 1);
  });
});
