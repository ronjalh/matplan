"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Users, Trash2, ChevronRight, Search, X } from "lucide-react";
import { deleteRecipe } from "./actions";
import { useState, useMemo } from "react";
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
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  isFishMeal: boolean;
  cuisine: string | null;
  source: string;
}

const dietFilters = [
  { key: "all", label: "Alle" },
  { key: "vegetarian", label: "Vegetar" },
  { key: "vegan", label: "Vegan" },
  { key: "pescetarian", label: "Pescetarisk" },
  { key: "glutenFree", label: "Glutenfri" },
  { key: "dairyFree", label: "Melkefri" },
  { key: "fish", label: "Fisk" },
] as const;

export function RecipeList({ recipes }: { recipes: Recipe[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = recipes;

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q)
      );
    }

    // Diet filter
    if (dietFilter !== "all") {
      result = result.filter((r) => {
        switch (dietFilter) {
          case "vegetarian": return r.isVegetarian;
          case "vegan": return r.isVegan;
          case "pescetarian": return r.isVegetarian || r.isFishMeal; // fish OK, meat not
          case "glutenFree": return r.isGlutenFree;
          case "dairyFree": return r.isDairyFree;
          case "fish": return r.isFishMeal;
          default: return true;
        }
      });
    }

    return result;
  }, [recipes, searchQuery, dietFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="space-y-3">
      {/* Search and filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="Søk i mine oppskrifter..."
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {dietFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setDietFilter(f.key); setVisibleCount(PAGE_SIZE); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                dietFilter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length === recipes.length
          ? `${recipes.length} oppskrifter`
          : `${filtered.length} av ${recipes.length} oppskrifter`}
      </p>

      {/* Recipe cards */}
      <div className="flex flex-col gap-3">
        {visible.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Ingen oppskrifter matcher filteret.
        </p>
      )}

      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          Vis flere ({filtered.length - visibleCount} gjenstår)
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
    <Link href={`/oppskrifter/${recipe.id}`} className="block group">
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
            {recipe.isGlutenFree && <Badge variant="outline">Glutenfri</Badge>}
            {recipe.isDairyFree && <Badge variant="outline">Melkefri</Badge>}
            {recipe.isNutFree && <Badge variant="outline">Nøttefri</Badge>}
            {recipe.source === "spoonacular" && (
              <Badge variant="outline" className="text-xs">Importert</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
