"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Trash2, ChevronRight } from "lucide-react";
import { deleteRecipe } from "./actions";
import { useState } from "react";
import Link from "next/link";

const PAGE_SIZE = 6;

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = recipes.slice(0, visibleCount);
  const hasMore = visibleCount < recipes.length;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">
        Dine oppskrifter ({recipes.length})
      </h2>
      <div className="flex flex-col gap-3">
        {visible.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
      {hasMore && (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          Vis flere ({recipes.length - visibleCount} gjenstår)
        </Button>
      )}
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Slette "${recipe.name}"?`)) return;
    setDeleting(true);
    await deleteRecipe(recipe.id);
  }

  return (
    <Link href={`/oppskrifter/${recipe.id}`} className="block">
      <Card className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base group-hover:text-primary transition-colors">
              {recipe.name}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-muted-foreground hover:text-destructive -mr-2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -mt-1" />
            </div>
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
    </Link>
  );
}
