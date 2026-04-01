/**
 * Tallerkensmodellen (The Norwegian Plate Model)
 * Source: Helsedirektoratet
 *
 * The plate is divided into three equal parts:
 * - 1/3 Vegetables/fruit
 * - 1/3 Carbohydrates (potatoes, rice, pasta, bread)
 * - 1/3 Protein (fish, meat, eggs, legumes)
 */

export interface PlateModelScore {
  vegetable: number; // 0.0 - 1.0
  carbohydrate: number;
  protein: number;
  assessment: "balanced" | "slightly-off" | "unbalanced";
}

type PlateCategory = "vegetable" | "carbohydrate" | "protein" | "other";

/**
 * Map ingredient categories to plate model categories.
 */
const categoryToPlate: Record<string, PlateCategory> = {
  groennsaker: "vegetable",
  frukt: "vegetable",
  baer: "vegetable",
  poteter: "carbohydrate",
  ris_pasta: "carbohydrate",
  broed: "carbohydrate",
  fullkorn: "carbohydrate",
  fisk: "protein",
  kjoett: "protein",
  egg: "protein",
  belgfrukter: "protein",
  meieri: "other",
  fett_olje: "other",
  krydder: "other",
  annet: "other",
};

export interface IngredientForPlateModel {
  category: string;
  quantityGrams: number;
}

/**
 * Calculate the plate model score for a set of ingredients.
 * Returns the proportion of each category and an overall assessment.
 */
export function calculatePlateModel(
  ingredients: IngredientForPlateModel[]
): PlateModelScore {
  let vegetableGrams = 0;
  let carbGrams = 0;
  let proteinGrams = 0;

  for (const ing of ingredients) {
    const plate = categoryToPlate[ing.category] ?? "other";
    switch (plate) {
      case "vegetable":
        vegetableGrams += ing.quantityGrams;
        break;
      case "carbohydrate":
        carbGrams += ing.quantityGrams;
        break;
      case "protein":
        proteinGrams += ing.quantityGrams;
        break;
    }
  }

  const total = vegetableGrams + carbGrams + proteinGrams;

  if (total === 0) {
    return { vegetable: 0, carbohydrate: 0, protein: 0, assessment: "unbalanced" };
  }

  const vegetable = vegetableGrams / total;
  const carbohydrate = carbGrams / total;
  const protein = proteinGrams / total;

  const assessment = getAssessment(vegetable, carbohydrate, protein);

  return {
    vegetable: Math.round(vegetable * 100) / 100,
    carbohydrate: Math.round(carbohydrate * 100) / 100,
    protein: Math.round(protein * 100) / 100,
    assessment,
  };
}

function getAssessment(
  veg: number,
  carb: number,
  protein: number
): PlateModelScore["assessment"] {
  const allInRange = (min: number, max: number) =>
    veg >= min && veg <= max && carb >= min && carb <= max && protein >= min && protein <= max;

  if (allInRange(0.25, 0.40)) return "balanced";
  if (allInRange(0.15, 0.50)) return "slightly-off";
  return "unbalanced";
}

/**
 * Get a Norwegian description of the plate model assessment.
 */
export function getPlateModelLabel(assessment: PlateModelScore["assessment"]): string {
  switch (assessment) {
    case "balanced":
      return "Balansert";
    case "slightly-off":
      return "Nesten balansert";
    case "unbalanced":
      return "Ubalansert";
  }
}
