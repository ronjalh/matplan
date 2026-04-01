import { getRecipes } from "./actions";
import { RecipeForm } from "./recipe-form";
import { RecipeList } from "./recipe-list";
import { Button } from "@/components/ui/button";
import { ChefHat, Search } from "lucide-react";
import Link from "next/link";

export default async function OppskrifterPage() {
  const recipes = await getRecipes();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-1">
            Oppskrifter
          </h1>
          <p className="text-muted-foreground">
            Lag egne oppskrifter eller søk blant tusenvis.
          </p>
        </div>
        <Link href="/oppskrifter/search">
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            Søk oppskrifter
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <RecipeForm />
        </div>
        <div>
          {recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ChefHat className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-center">
                Ingen oppskrifter ennå.
                <br />
                Lag din første oppskrift eller{" "}
                <Link href="/oppskrifter/search" className="text-primary hover:underline">
                  søk blant tusenvis
                </Link>
                !
              </p>
            </div>
          ) : (
            <RecipeList recipes={recipes} />
          )}
        </div>
      </div>
    </div>
  );
}
