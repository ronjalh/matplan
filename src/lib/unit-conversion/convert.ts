/**
 * Unit conversion: International (US/UK) → Norwegian
 * Used when importing recipes from Spoonacular or international sites.
 */

interface ConversionResult {
  quantity: number;
  unit: string;
  approximate: boolean;
}

const LIQUID_CUP_ML = 236.6;
const TBSP_ML = 15;
const TSP_ML = 5;
const OZ_G = 28.35;
const LB_G = 453.6;
const FL_OZ_ML = 29.57;

/**
 * Convert a US/UK measurement to Norwegian units.
 * Returns the converted quantity, Norwegian unit, and whether it's approximate.
 */
export function convertToNorwegian(
  quantity: number,
  unit: string
): ConversionResult {
  const normalized = unit.toLowerCase().trim();

  switch (normalized) {
    // Volume — to dl or ml
    case "cup":
    case "cups": {
      const ml = quantity * LIQUID_CUP_ML;
      if (ml >= 100) {
        return { quantity: round(ml / 100, 0.25), unit: "dl", approximate: true };
      }
      return { quantity: round(ml, 5), unit: "ml", approximate: true };
    }

    case "tablespoon":
    case "tablespoons":
    case "tbsp":
    case "tbsps":
    case "tbs":
    case "t": {
      return { quantity: round(quantity, 0.5), unit: "ss", approximate: false };
    }

    case "teaspoon":
    case "teaspoons":
    case "tsp":
    case "tsps": {
      return { quantity: round(quantity, 0.5), unit: "ts", approximate: false };
    }

    case "fluid ounce":
    case "fluid ounces":
    case "fl oz": {
      const ml = quantity * FL_OZ_ML;
      if (ml >= 100) {
        return { quantity: round(ml / 100, 0.25), unit: "dl", approximate: true };
      }
      return { quantity: round(ml, 5), unit: "ml", approximate: true };
    }

    case "quart":
    case "quarts":
    case "qt": {
      const dl = (quantity * 4 * LIQUID_CUP_ML) / 100;
      return { quantity: round(dl, 0.5), unit: "dl", approximate: true };
    }

    case "pint":
    case "pints":
    case "pt": {
      const dl = (quantity * 2 * LIQUID_CUP_ML) / 100;
      return { quantity: round(dl, 0.5), unit: "dl", approximate: true };
    }

    case "gallon":
    case "gallons":
    case "gal": {
      const l = (quantity * 16 * LIQUID_CUP_ML) / 1000;
      return { quantity: round(l, 0.1), unit: "l", approximate: true };
    }

    // Weight
    case "ounce":
    case "ounces":
    case "oz": {
      const g = quantity * OZ_G;
      if (g >= 1000) {
        return { quantity: round(g / 1000, 0.1), unit: "kg", approximate: false };
      }
      return { quantity: round(g, 10), unit: "g", approximate: false };
    }

    case "pound":
    case "pounds":
    case "lb":
    case "lbs": {
      const g = quantity * LB_G;
      if (g >= 1000) {
        return { quantity: round(g / 1000, 0.1), unit: "kg", approximate: false };
      }
      return { quantity: round(g, 10), unit: "g", approximate: false };
    }

    // Temperature (in instructions text)
    case "°f":
    case "f": {
      const celsius = (quantity - 32) * (5 / 9);
      return { quantity: Math.round(celsius / 5) * 5, unit: "°C", approximate: false };
    }

    // Already metric — normalize to Norwegian abbreviations
    case "g":
    case "gram":
    case "grams":
      return { quantity: round(quantity, 1), unit: "g", approximate: false };

    case "kg":
    case "kilogram":
    case "kilograms":
      return { quantity: round(quantity, 0.1), unit: "kg", approximate: false };

    case "ml":
    case "milliliter":
    case "milliliters":
      return { quantity: round(quantity, 5), unit: "ml", approximate: false };

    case "l":
    case "liter":
    case "liters":
    case "litre":
    case "litres":
      return { quantity: round(quantity, 0.1), unit: "l", approximate: false };

    case "dl":
    case "deciliter":
    case "deciliters":
      return { quantity: round(quantity, 0.25), unit: "dl", approximate: false };

    // Count-based — keep as is
    case "piece":
    case "pieces":
    case "whole":
      return { quantity: Math.round(quantity), unit: "stk", approximate: false };

    case "clove":
    case "cloves":
      return { quantity: Math.round(quantity), unit: "fedd", approximate: false };

    case "bunch":
    case "bunches":
      return { quantity: Math.round(quantity), unit: "bunt", approximate: false };

    case "sprig":
    case "sprigs":
      return { quantity: Math.round(quantity), unit: "kvast", approximate: false };

    case "pinch":
    case "pinches":
      return { quantity, unit: "klype", approximate: false };

    case "dash":
    case "dashes":
      return { quantity, unit: "dæsj", approximate: false };

    case "serving":
    case "servings":
      return { quantity: Math.round(quantity), unit: "porsjon", approximate: false };

    case "small":
    case "medium":
    case "large":
      return { quantity: Math.round(quantity), unit: "stk", approximate: false };

    case "handful":
      return { quantity: Math.round(quantity), unit: "neve", approximate: false };

    case "leaf":
    case "leaves":
      return { quantity: Math.round(quantity), unit: "blad", approximate: false };

    case "slice":
    case "slices":
      return { quantity: Math.round(quantity), unit: "skive", approximate: false };

    case "can":
    case "cans":
      return { quantity: Math.round(quantity), unit: "bx", approximate: false };

    case "jar":
    case "jars":
      return { quantity: Math.round(quantity), unit: "glass", approximate: false };

    case "package":
    case "packages":
    case "packet":
    case "packets":
      return { quantity: Math.round(quantity), unit: "pk", approximate: false };

    case "stick":
    case "sticks":
      return { quantity: Math.round(quantity), unit: "stk", approximate: false };

    case "":
      return { quantity: Math.round(quantity), unit: "stk", approximate: false };

    // Unknown unit — pass through
    default:
      return { quantity, unit: normalized, approximate: false };
  }
}

/**
 * Round to nearest step (e.g., 0.25 for dl, 10 for grams).
 */
function round(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Format a Norwegian measurement for display.
 * Example: "2.5 dl", "ca. 3 dl", "400 g"
 */
export function formatMeasurement(
  quantity: number,
  unit: string,
  approximate: boolean
): string {
  const prefix = approximate ? "ca. " : "";
  const formatted = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toFixed(quantity < 10 ? 1 : 0).replace(".", ",");
  return `${prefix}${formatted} ${unit}`;
}
