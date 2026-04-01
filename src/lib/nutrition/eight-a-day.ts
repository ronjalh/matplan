/**
 * 8 om dagen (8 a Day) — Norwegian dietary guideline
 * Source: Helsedirektoratet
 *
 * 8 servings per day:
 * - 5 servings of fruit and vegetables
 * - 3 servings of whole grains
 *
 * 1 serving ≈ 100g for fruit/vegetables, ~40g for whole grain
 */

export interface EightADayResult {
  fruitVegServings: number;
  wholeGrainServings: number;
  totalServings: number;
  target: 8;
  percentage: number; // 0-100+
}

/** Categories that count toward the 5 fruit/veg servings */
const FRUIT_VEG_CATEGORIES = new Set([
  "groennsaker",
  "frukt",
  "baer",
]);

/** Categories that count toward the 3 whole grain servings */
const WHOLE_GRAIN_CATEGORIES = new Set([
  "fullkorn",
]);

/** Categories that explicitly do NOT count */
// "poteter" — carbohydrate, not vegetable for 8-om-dagen
// "ris_pasta" — only whole grain variants count, tracked separately
// "broed" — only whole grain variants count

/** Grams per serving by type */
const GRAMS_PER_SERVING_FRUIT_VEG = 100;
const GRAMS_PER_SERVING_WHOLE_GRAIN = 40;

/** Juice cap: max 1 serving regardless of quantity */
const JUICE_MAX_SERVINGS = 1;

export interface IngredientForEightADay {
  category: string;
  quantityGrams: number;
  isJuice?: boolean;
  isWholeGrain?: boolean; // for bread/rice/pasta that might be whole grain
}

/**
 * Calculate 8-om-dagen servings for a set of ingredients (typically one meal).
 */
export function calculateEightADay(
  ingredients: IngredientForEightADay[]
): EightADayResult {
  let fruitVegGrams = 0;
  let wholeGrainGrams = 0;
  let hasJuice = false;

  for (const ing of ingredients) {
    // Juice: counts as max 1 serving
    if (ing.isJuice) {
      hasJuice = true;
      continue;
    }

    // Fruit and vegetables
    if (FRUIT_VEG_CATEGORIES.has(ing.category)) {
      fruitVegGrams += ing.quantityGrams;
      continue;
    }

    // Whole grain
    if (WHOLE_GRAIN_CATEGORIES.has(ing.category)) {
      wholeGrainGrams += ing.quantityGrams;
      continue;
    }

    // Bread/rice/pasta that is whole grain
    if (ing.isWholeGrain && ["broed", "ris_pasta"].includes(ing.category)) {
      wholeGrainGrams += ing.quantityGrams;
    }
  }

  let fruitVegServings = fruitVegGrams / GRAMS_PER_SERVING_FRUIT_VEG;
  if (hasJuice) {
    fruitVegServings = Math.min(fruitVegServings + JUICE_MAX_SERVINGS, fruitVegServings + 1);
  }

  const wholeGrainServings = wholeGrainGrams / GRAMS_PER_SERVING_WHOLE_GRAIN;

  // Cap at 5 for fruit/veg and 3 for whole grain (targets)
  const cappedFruitVeg = Math.min(fruitVegServings, 5);
  const cappedWholeGrain = Math.min(wholeGrainServings, 3);
  const totalServings = cappedFruitVeg + cappedWholeGrain;

  return {
    fruitVegServings: Math.round(fruitVegServings * 10) / 10,
    wholeGrainServings: Math.round(wholeGrainServings * 10) / 10,
    totalServings: Math.round(totalServings * 10) / 10,
    target: 8,
    percentage: Math.round((totalServings / 8) * 100),
  };
}

/**
 * Get a simple label for 8-om-dagen progress.
 */
export function getEightADayLabel(result: EightADayResult): string {
  if (result.totalServings >= 8) return "Mål nådd!";
  return `${result.totalServings} av 8 porsjoner`;
}
