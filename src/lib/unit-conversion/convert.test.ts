import { describe, it, expect } from "vitest";
import { convertToNorwegian, formatMeasurement } from "./convert";

describe("convertToNorwegian", () => {
  describe("Volume — cups to dl", () => {
    it("converts 1 cup to ~2.25-2.5 dl", () => {
      const result = convertToNorwegian(1, "cup");
      expect(result.unit).toBe("dl");
      expect(result.quantity).toBeGreaterThanOrEqual(2);
      expect(result.quantity).toBeLessThanOrEqual(2.5);
      expect(result.approximate).toBe(true);
    });

    it("converts 0.5 cups to ~1-1.25 dl", () => {
      const result = convertToNorwegian(0.5, "cups");
      expect(result.unit).toBe("dl");
      expect(result.quantity).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Spoons", () => {
    it("converts tablespoon to ss", () => {
      expect(convertToNorwegian(2, "tablespoon")).toEqual({
        quantity: 2, unit: "ss", approximate: false,
      });
    });

    it("converts tbsps to ss", () => {
      expect(convertToNorwegian(1, "tbsps")).toEqual({
        quantity: 1, unit: "ss", approximate: false,
      });
    });

    it("converts teaspoon to ts", () => {
      expect(convertToNorwegian(1, "teaspoon")).toEqual({
        quantity: 1, unit: "ts", approximate: false,
      });
    });

    it("converts tsps to ts", () => {
      expect(convertToNorwegian(3, "tsps")).toEqual({
        quantity: 3, unit: "ts", approximate: false,
      });
    });
  });

  describe("Weight", () => {
    it("converts ounces to grams", () => {
      const result = convertToNorwegian(8, "oz");
      expect(result.unit).toBe("g");
      expect(result.quantity).toBe(230); // 8 * 28.35 ≈ 227 → rounded to 230
    });

    it("converts pounds to grams", () => {
      const result = convertToNorwegian(1, "lb");
      expect(result.unit).toBe("g");
      expect(result.quantity).toBe(450); // 453.6 → rounded to 450
    });

    it("converts large pounds to kg", () => {
      const result = convertToNorwegian(3, "lbs");
      expect(result.unit).toBe("kg");
      expect(result.quantity).toBeCloseTo(1.4, 1);
    });
  });

  describe("Temperature", () => {
    it("converts 350°F to ~175°C", () => {
      const result = convertToNorwegian(350, "°f");
      expect(result.unit).toBe("°C");
      expect(result.quantity).toBe(175);
    });

    it("converts 400°F to ~200°C", () => {
      const result = convertToNorwegian(400, "°f");
      expect(result.unit).toBe("°C");
      expect(result.quantity).toBe(205);
    });
  });

  describe("Count-based", () => {
    it("converts serving to porsjon", () => {
      expect(convertToNorwegian(4, "servings")).toEqual({
        quantity: 4, unit: "porsjon", approximate: false,
      });
    });

    it("converts clove to fedd", () => {
      expect(convertToNorwegian(3, "cloves")).toEqual({
        quantity: 3, unit: "fedd", approximate: false,
      });
    });

    it("converts pinch to klype", () => {
      expect(convertToNorwegian(1, "pinch")).toEqual({
        quantity: 1, unit: "klype", approximate: false,
      });
    });

    it("converts can to bx", () => {
      expect(convertToNorwegian(2, "cans")).toEqual({
        quantity: 2, unit: "bx", approximate: false,
      });
    });

    it("converts slice to skive", () => {
      expect(convertToNorwegian(3, "slices")).toEqual({
        quantity: 3, unit: "skive", approximate: false,
      });
    });
  });

  describe("Already metric — passthrough", () => {
    it("keeps grams", () => {
      expect(convertToNorwegian(400, "g")).toEqual({
        quantity: 400, unit: "g", approximate: false,
      });
    });

    it("keeps dl", () => {
      expect(convertToNorwegian(2, "dl")).toEqual({
        quantity: 2, unit: "dl", approximate: false,
      });
    });
  });

  describe("Unknown unit", () => {
    it("passes through unknown units", () => {
      expect(convertToNorwegian(1, "bunch of")).toEqual({
        quantity: 1, unit: "bunch of", approximate: false,
      });
    });
  });
});

describe("formatMeasurement", () => {
  it("formats regular measurements", () => {
    expect(formatMeasurement(400, "g", false)).toBe("400 g");
  });

  it("formats approximate measurements with ca.", () => {
    expect(formatMeasurement(2.5, "dl", true)).toBe("ca. 2,5 dl");
  });

  it("formats integer values without decimals", () => {
    expect(formatMeasurement(3, "stk", false)).toBe("3 stk");
  });
});
