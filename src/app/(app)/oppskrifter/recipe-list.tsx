"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";
import Link from "next/link";

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
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/oppskrifter/${recipe.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{recipe.name}</CardTitle>
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
    </Link>
  );
}
