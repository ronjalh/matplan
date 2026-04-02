"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateWeekPlan } from "@/lib/meal-plan/auto-generate";
import { addMeal } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Fish, RefreshCw, Check, X, Loader2 } from "lucide-react";
import { matpratRecipes } from "@/data/matprat-recipes";

const dayNames = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

type RecipeSource = "mine" | "matprat" | "begge";

interface Recipe {
  id: number;
  name: string;
  isFishMeal: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  cuisine: string | null;
  prepTimeMinutes: number | null;
}

interface AutoPlanProps {
  recipes: Recipe[];
  diet: string;
  weekDates: string[]; // 7 ISO date strings (Mon-Sun)
  existingMealDays: Set<string>; // dates that already have middag
  onClose: () => void;
}

export function AutoPlan({ recipes, diet, weekDates, existingMealDays, onClose }: AutoPlanProps) {
  const router = useRouter();
  const [source, setSource] = useState<RecipeSource>(recipes.length > 0 ? "mine" : "matprat");
  const [plan, setPlan] = useState(() =>
    generateWeekPlan(getRecipePool(recipes.length > 0 ? "mine" : "matprat", recipes), diet as any)
  );
  const [saving, setSaving] = useState(false);

  function getRecipePool(src: RecipeSource, ownRecipes: Recipe[]): Recipe[] {
    switch (src) {
      case "mine": return ownRecipes;
      case "matprat": return matpratRecipes;
      case "begge": return [...ownRecipes, ...matpratRecipes];
    }
  }

  function changeSource(src: RecipeSource) {
    setSource(src);
    setPlan(generateWeekPlan(getRecipePool(src, recipes), diet as any));
  }

  function regenerate() {
    setPlan(generateWeekPlan(getRecipePool(source, recipes), diet as any));
  }

  function swapMeal(dayIndex: number) {
    const pool = getRecipePool(source, recipes);
    const current = plan.meals.find((m) => m.dayIndex === dayIndex);
    const others = pool.filter((r) => r.id !== current?.recipe.id);
    if (others.length === 0) return;
    const newRecipe = others[Math.floor(Math.random() * others.length)];

    setPlan((prev) => ({
      ...prev,
      meals: prev.meals.map((m) =>
        m.dayIndex === dayIndex ? { ...m, recipe: newRecipe } : m
      ),
      fishCount: prev.meals
        .map((m) => (m.dayIndex === dayIndex ? newRecipe : m.recipe))
        .filter((r) => r.isFishMeal).length,
    }));
  }

  async function handleApply() {
    setSaving(true);
    for (const meal of plan.meals) {
      const date = weekDates[meal.dayIndex];
      if (!date) continue;
      if (existingMealDays.has(date)) continue;

      if (meal.recipe.id < 0) {
        // Matprat recipe — add as free text (no DB recipe)
        await addMeal(date, "middag", null, meal.recipe.name);
      } else {
        await addMeal(date, "middag", meal.recipe.id, null);
      }
    }
    setSaving(false);
    onClose();
    router.refresh();
  }

  const skippedDays = plan.meals.filter((m) => existingMealDays.has(weekDates[m.dayIndex])).length;
  const isMatpratRecipe = (id: number) => id < 0;

  return (
    <Card className="border-primary">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            Generer middagsplan
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Source selector */}
        <div className="flex gap-1">
          <button
            onClick={() => changeSource("mine")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              source === "mine" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Mine oppskrifter ({recipes.length})
          </button>
          <button
            onClick={() => changeSource("matprat")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              source === "matprat" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Norske middager
          </button>
          <button
            onClick={() => changeSource("begge")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              source === "begge" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Begge
          </button>
        </div>

        {/* Warnings */}
        {plan.warnings.map((w, i) => (
          <p key={i} className="text-xs text-[var(--color-warning)] bg-[var(--color-warning)]/10 rounded-md px-2 py-1">
            {w}
          </p>
        ))}

        {/* Plan preview */}
        {plan.meals.length > 0 ? (
          <div className="space-y-1">
            {plan.meals.map((meal) => {
              const date = weekDates[meal.dayIndex];
              const hasExisting = existingMealDays.has(date);
              const fromMatprat = isMatpratRecipe(meal.recipe.id);
              return (
                <div
                  key={meal.dayIndex}
                  className={`flex items-center gap-2 text-sm rounded-md px-2 py-1.5 ${
                    hasExisting ? "opacity-40 line-through" : "hover:bg-muted"
                  }`}
                >
                  <span className="w-16 text-xs text-muted-foreground shrink-0">
                    {dayNames[meal.dayIndex]}
                  </span>
                  <span className="flex-1 font-medium truncate">
                    {meal.recipe.name}
                  </span>
                  {fromMatprat && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded shrink-0">forslag</span>
                  )}
                  {meal.recipe.isFishMeal && (
                    <Fish className="w-3.5 h-3.5 text-[var(--color-fish)] shrink-0" />
                  )}
                  {meal.recipe.cuisine && (
                    <span className="text-[10px] text-muted-foreground shrink-0">{meal.recipe.cuisine}</span>
                  )}
                  {!hasExisting && (
                    <button
                      onClick={() => swapMeal(meal.dayIndex)}
                      className="text-muted-foreground hover:text-primary cursor-pointer shrink-0"
                      title="Bytt oppskrift"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Ingen oppskrifter å velge fra. Legg til oppskrifter først.
          </p>
        )}

        {/* Stats */}
        {plan.meals.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <Fish className="w-3 h-3 inline mr-1 text-[var(--color-fish)]" />
              {plan.fishCount} fiskemåltider
            </span>
            {skippedDays > 0 && (
              <span>{skippedDays} dager hoppet over (har allerede middag)</span>
            )}
          </div>
        )}

        {/* Info about matprat recipes */}
        {source !== "mine" && plan.meals.some((m) => isMatpratRecipe(m.recipe.id)) && (
          <p className="text-[11px] text-muted-foreground">
            Forslag-oppskrifter legges til som fritekst. Du kan søke opp oppskriften på matprat.no.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={regenerate} className="gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Ny forslag
          </Button>
          {plan.meals.length > 0 && (
            <Button size="sm" onClick={handleApply} disabled={saving} className="gap-1 flex-1">
              {saving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Legger til...</>
              ) : (
                <><Check className="w-3.5 h-3.5" /> Legg i kalender</>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
