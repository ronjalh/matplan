/**
 * Fish Tracker — Norwegian dietary recommendation
 * Source: Helsedirektoratet
 *
 * Recommended: 2-3 fish dinners per week
 * At least one should be fatty fish (laks, makrell, sild, ørret, sardiner)
 */

export interface FishWeekResult {
  fishMeals: number;
  target: { min: 2; max: 3 };
  status: "below" | "good" | "above";
}

/**
 * Calculate fish meal count for a week.
 */
export function calculateFishWeek(fishMealCount: number): FishWeekResult {
  let status: FishWeekResult["status"];
  if (fishMealCount < 2) status = "below";
  else if (fishMealCount <= 3) status = "good";
  else status = "above";

  return {
    fishMeals: fishMealCount,
    target: { min: 2, max: 3 },
    status,
  };
}

/**
 * Get a Norwegian label for fish tracker status.
 */
export function getFishTrackerLabel(result: FishWeekResult): string {
  switch (result.status) {
    case "below":
      return `${result.fishMeals} av 2–3 fiskemåltider`;
    case "good":
      return `${result.fishMeals} av 2–3 fiskemåltider ✓`;
    case "above":
      return `${result.fishMeals} fiskemåltider (anbefalt 2–3)`;
  }
}
