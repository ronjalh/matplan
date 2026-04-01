"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeForm } from "./recipe-form";
import { RecipeList } from "./recipe-list";
import { ExploreSearch } from "./explore-search";
import { ChefHat, BookOpen, Compass } from "lucide-react";
import { useSearchParams } from "next/navigation";

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

export function RecipeTabs({ recipes }: { recipes: Recipe[] }) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "utforsk" ? "utforsk" : "mine";

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="w-full justify-start">
        <TabsTrigger value="mine" className="gap-2">
          <BookOpen className="w-4 h-4" />
          Mine oppskrifter ({recipes.length})
        </TabsTrigger>
        <TabsTrigger value="utforsk" className="gap-2">
          <Compass className="w-4 h-4" />
          Utforsk
        </TabsTrigger>
        <TabsTrigger value="ny" className="gap-2">
          <ChefHat className="w-4 h-4" />
          Ny oppskrift
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mine" className="mt-4">
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ChefHat className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-center">
              Ingen oppskrifter ennå.
              <br />
              Lag en ny oppskrift eller utforsk tusenvis av oppskrifter!
            </p>
          </div>
        ) : (
          <RecipeList recipes={recipes} />
        )}
      </TabsContent>

      <TabsContent value="utforsk" className="mt-4">
        <ExploreSearch />
      </TabsContent>

      <TabsContent value="ny" className="mt-4 max-w-lg">
        <RecipeForm />
      </TabsContent>
    </Tabs>
  );
}
