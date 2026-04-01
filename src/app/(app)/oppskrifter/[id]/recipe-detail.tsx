"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRecipe, deleteRecipe } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlateModelVisual } from "@/components/nutrition/plate-model-visual";
import { EightADayTracker } from "@/components/nutrition/eight-a-day-tracker";
import { Badge } from "@/components/ui/badge";
import { IngredientEditor, type IngredientInput } from "@/components/recipe/ingredient-editor";
import { ArrowLeft, Pencil, Trash2, Clock, Users, X } from "lucide-react";
import Link from "next/link";

interface RecipeWithIngredients {
  id: number;
  name: string;
  description: string | null;
  servings: number;
  prepTimeMinutes: number | null;
  instructions: string | null;
  plateModelScore: { vegetable: number; carbohydrate: number; protein: number } | null;
  eightADayServings: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  isFishMeal: boolean;
  cuisine: string | null;
  source: string;
  ingredients: {
    id: number;
    quantity: number;
    unit: string;
    originalText: string | null;
  }[];
}

export function RecipeDetail({ recipe }: { recipe: RecipeWithIngredients }) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await updateRecipe(recipe.id, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditing(false);
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Slette "${recipe.name}"?`)) return;
    await deleteRecipe(recipe.id);
    router.push("/oppskrifter");
  }

  // Parse ingredient names from originalText
  const existingIngredients: IngredientInput[] = recipe.ingredients.map((ing) => {
    const text = ing.originalText ?? "";
    // originalText format: "400 g laks"
    const parts = text.split(" ");
    const name = parts.slice(2).join(" ") || text;
    return { quantity: ing.quantity, unit: ing.unit, name };
  });

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
            Rediger oppskrift
          </h1>
          <Button variant="ghost" onClick={() => setEditing(false)}>
            <X className="w-4 h-4 mr-1" /> Avbryt
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn *</Label>
                <Input id="name" name="name" defaultValue={recipe.name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Kort beskrivelse</Label>
                <Input id="description" name="description" defaultValue={recipe.description ?? ""} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servings">Porsjoner</Label>
                  <Input id="servings" name="servings" type="number" defaultValue={recipe.servings} min={1} max={20} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTimeMinutes">Tid (minutter)</Label>
                  <Input id="prepTimeMinutes" name="prepTimeMinutes" type="number" defaultValue={recipe.prepTimeMinutes ?? ""} min={1} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">Kjøkken</Label>
                <Input id="cuisine" name="cuisine" defaultValue={recipe.cuisine ?? ""} />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isVegetarian" defaultChecked={recipe.isVegetarian} className="rounded" />
                  Vegetar
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isVegan" defaultChecked={recipe.isVegan} className="rounded" />
                  Vegan
                </label>
              </div>

              <div className="space-y-2">
                <Label>Ingredienser</Label>
                <IngredientEditor initial={existingIngredients} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Fremgangsmåte</Label>
                <Textarea id="instructions" name="instructions" defaultValue={recipe.instructions ?? ""} rows={6} />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/oppskrifter" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold flex-1">
          {recipe.name}
        </h1>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="w-4 h-4 mr-1" /> Rediger
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {recipe.description && (
        <p className="text-muted-foreground">{recipe.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" /> {recipe.servings} porsjoner
        </span>
        {recipe.prepTimeMinutes && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {recipe.prepTimeMinutes} min
          </span>
        )}
        {recipe.cuisine && <Badge variant="secondary">{recipe.cuisine}</Badge>}
        {recipe.isVegetarian && (
          <Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)]">Vegetar</Badge>
        )}
        {recipe.isVegan && (
          <Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)]">Vegan</Badge>
        )}
        {recipe.isFishMeal && (
          <Badge className="bg-[var(--color-fish)]/10 text-[var(--color-fish)]">Fisk</Badge>
        )}
      </div>

      {recipe.ingredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingredienser</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="text-sm py-1 border-b border-border last:border-0">
                  {ing.originalText ?? `${ing.quantity} ${ing.unit}`}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Nutrition visualizations */}
      {recipe.plateModelScore && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ernæring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <PlateModelVisual score={{
                vegetable: recipe.plateModelScore.vegetable,
                carbohydrate: recipe.plateModelScore.carbohydrate,
                protein: recipe.plateModelScore.protein,
                assessment:
                  recipe.plateModelScore.vegetable >= 0.25 && recipe.plateModelScore.vegetable <= 0.40 &&
                  recipe.plateModelScore.carbohydrate >= 0.25 && recipe.plateModelScore.carbohydrate <= 0.40 &&
                  recipe.plateModelScore.protein >= 0.25 && recipe.plateModelScore.protein <= 0.40
                    ? "balanced"
                    : recipe.plateModelScore.vegetable >= 0.15 && recipe.plateModelScore.protein >= 0.15
                    ? "slightly-off"
                    : "unbalanced",
              }} />
              {recipe.eightADayServings != null && (
                <EightADayTracker result={{
                  fruitVegServings: recipe.eightADayServings,
                  wholeGrainServings: 0,
                  totalServings: recipe.eightADayServings,
                  target: 8,
                  percentage: Math.round((recipe.eightADayServings / 8) * 100),
                }} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {recipe.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fremgangsmåte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {recipe.instructions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
