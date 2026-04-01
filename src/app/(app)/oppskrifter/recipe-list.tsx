"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Trash2 } from "lucide-react";
import { deleteRecipe } from "./actions";
import { useState } from "react";

interface Recipe {
  id: number;
  name: string;
  description: string | null;
  servings: number;
  prepTimeMinutes: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isFishMeal: boolean;
  cuisine: string | null;
  source: string;
}

export function RecipeList({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">
        Dine oppskrifter ({recipes.length})
      </h2>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Slette "${recipe.name}"?`)) return;
    setDeleting(true);
    await deleteRecipe(recipe.id);
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{recipe.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-muted-foreground hover:text-destructive -mr-2 -mt-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recipe.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {recipe.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {recipe.servings} porsjoner
          </span>
          {recipe.prepTimeMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {recipe.prepTimeMinutes} min
            </span>
          )}
          {recipe.cuisine && (
            <Badge variant="secondary">{recipe.cuisine}</Badge>
          )}
          {recipe.isVegetarian && (
            <Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20">
              Vegetar
            </Badge>
          )}
          {recipe.isVegan && (
            <Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20">
              Vegan
            </Badge>
          )}
          {recipe.isFishMeal && (
            <Badge className="bg-[var(--color-fish)]/10 text-[var(--color-fish)] hover:bg-[var(--color-fish)]/20">
              Fisk
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
