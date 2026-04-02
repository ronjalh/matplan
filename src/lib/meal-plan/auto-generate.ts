/**
 * Auto-generate a weekly meal plan from saved recipes.
 * Respects: fish 2-3/week, dietary preference, variety.
 */

interface RecipeForPlan {
  id: number;
  name: string;
  isFishMeal: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  cuisine: string | null;
  prepTimeMinutes: number | null;
}

interface GeneratedPlan {
  meals: { dayIndex: number; recipe: RecipeForPlan }[];
  fishCount: number;
  warnings: string[];
}

/**
 * Generate 7 dinner suggestions from available recipes.
 */
export function generateWeekPlan(
  recipes: RecipeForPlan[],
  diet: "all" | "vegetarian" | "vegan" | "pescetarian",
  targetFishMeals: number = 2
): GeneratedPlan {
  const warnings: string[] = [];

  // Filter by dietary preference
  let eligible = recipes;
  if (diet === "vegetarian") {
    eligible = recipes.filter((r) => r.isVegetarian);
  } else if (diet === "vegan") {
    eligible = recipes.filter((r) => r.isVegan);
  } else if (diet === "pescetarian") {
    eligible = recipes.filter((r) => r.isVegetarian || r.isFishMeal);
  }

  if (eligible.length === 0) {
    return { meals: [], fishCount: 0, warnings: ["Ingen oppskrifter matcher kostholdet ditt. Legg til flere oppskrifter."] };
  }

  if (eligible.length < 7) {
    warnings.push("Få oppskrifter tilgjengelig — noen kan gjentas.");
  }

  // Separate fish and non-fish
  const fishRecipes = eligible.filter((r) => r.isFishMeal);
  const nonFishRecipes = eligible.filter((r) => !r.isFishMeal);

  // Determine actual fish count
  let actualFishTarget = targetFishMeals;
  if (diet === "vegetarian" || diet === "vegan") {
    actualFishTarget = 0; // No fish for vegetarians/vegans
  } else if (fishRecipes.length === 0) {
    actualFishTarget = 0;
    warnings.push("Ingen fiskeoppskrifter funnet — legg til for å nå fisk-anbefalingen.");
  } else if (fishRecipes.length < targetFishMeals) {
    actualFishTarget = fishRecipes.length;
    warnings.push(`Bare ${fishRecipes.length} fiskeoppskrift(er) — anbefalt er ${targetFishMeals}.`);
  }

  const meals: { dayIndex: number; recipe: RecipeForPlan }[] = [];
  const usedIds = new Set<number>();

  // Pick fish meals first (spread across week)
  const fishDays = spreadDays(actualFishTarget, 7);
  for (const day of fishDays) {
    const recipe = pickRandom(fishRecipes, usedIds);
    if (recipe) {
      meals.push({ dayIndex: day, recipe });
      usedIds.add(recipe.id);
    }
  }

  // Fill remaining days with non-fish (or any if not enough non-fish)
  for (let day = 0; day < 7; day++) {
    if (meals.some((m) => m.dayIndex === day)) continue; // Already has a meal

    // Try non-fish first, then any eligible
    let recipe = pickRandom(nonFishRecipes, usedIds);
    if (!recipe) recipe = pickRandom(eligible, usedIds);
    if (!recipe) {
      // All used, allow repeats
      usedIds.clear();
      recipe = pickRandom(eligible, new Set());
    }

    if (recipe) {
      meals.push({ dayIndex: day, recipe });
      usedIds.add(recipe.id);
    }
  }

  // Sort by day
  meals.sort((a, b) => a.dayIndex - b.dayIndex);

  const fishCount = meals.filter((m) => m.recipe.isFishMeal).length;

  return { meals, fishCount, warnings };
}

/** Pick a random recipe not yet used */
function pickRandom(recipes: RecipeForPlan[], usedIds: Set<number>): RecipeForPlan | null {
  const available = recipes.filter((r) => !usedIds.has(r.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

/** Spread N items across W slots as evenly as possible */
function spreadDays(count: number, total: number): number[] {
  if (count <= 0) return [];
  if (count >= total) return Array.from({ length: total }, (_, i) => i);
  const step = total / count;
  return Array.from({ length: count }, (_, i) => Math.floor(i * step + step / 2));
}
