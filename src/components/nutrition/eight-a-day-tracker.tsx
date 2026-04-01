"use client";

import type { EightADayResult } from "@/lib/nutrition/eight-a-day";

interface EightADayTrackerProps {
  result: EightADayResult;
}

/**
 * Visual tracker showing 8 circles for "8 om dagen" progress.
 * Filled circles = servings achieved.
 */
export function EightADayTracker({ result }: EightADayTrackerProps) {
  const filled = Math.min(Math.floor(result.totalServings), 8);

  return (
    <div
      role="progressbar"
      aria-valuenow={result.totalServings}
      aria-valuemin={0}
      aria-valuemax={8}
      aria-label={`8 om dagen: ${result.totalServings} av 8 porsjoner`}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 8 }, (_, i) => {
          const isFruitVeg = i < 5;
          const isFilled = i < filled;

          return (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-colors ${
                isFilled
                  ? isFruitVeg
                    ? "bg-[var(--color-success)] border-[var(--color-success)]"
                    : "bg-[var(--color-warning)] border-[var(--color-warning)]"
                  : "border-muted-foreground/30 bg-transparent"
              }`}
              title={isFruitVeg ? "Frukt/grønt" : "Fullkorn"}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          Frukt/grønt: {result.fruitVegServings}/5
        </span>
        <span>
          Fullkorn: {result.wholeGrainServings}/3
        </span>
      </div>
    </div>
  );
}
