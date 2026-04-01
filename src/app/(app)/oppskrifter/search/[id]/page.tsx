import { getRecipeDetails } from "@/recipe-api/spoonacular";
import { convertToNorwegian, formatMeasurement } from "@/lib/unit-conversion/convert";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImportButton } from "./import-button";

export default async function SpoonacularPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipeId = parseInt(id);
  if (isNaN(recipeId)) notFound();

  let recipe;
  try {
    recipe = await getRecipeDetails(recipeId);
  } catch {
    notFound();
  }

  // Convert ingredients to Norwegian
  const convertedIngredients = recipe.extendedIngredients?.map((ing) => {
    const metric = ing.measures?.metric;
    const amount = metric?.amount ?? ing.amount;
    const unit = metric?.unitShort ?? ing.unit;
    const converted = convertToNorwegian(amount, unit);
    const display = formatMeasurement(converted.quantity, converted.unit, converted.approximate);
    return {
      display: `${display} ${ing.name}`,
      original: ing.original,
    };
  }) ?? [];

  const instructions = recipe.analyzedInstructions?.[0]?.steps ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/oppskrifter/search" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold flex-1">
          {recipe.title}
        </h1>
      </div>

      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-56 object-cover rounded-lg"
        />
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" /> {recipe.servings} porsjoner
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" /> {recipe.readyInMinutes} min
        </span>
        {recipe.cuisines?.map((c) => (
          <Badge key={c} variant="secondary">{c}</Badge>
        ))}
        {recipe.vegetarian && (
          <Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)]">Vegetar</Badge>
        )}
        {recipe.vegan && (
          <Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)]">Vegan</Badge>
        )}
        {recipe.glutenFree && <Badge variant="outline">Glutenfri</Badge>}
        {recipe.dairyFree && <Badge variant="outline">Melkefri</Badge>}
      </div>

      <ImportButton spoonacularId={recipe.id} />

      {convertedIngredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {convertedIngredients.map((ing, i) => (
                <li key={i} className="text-sm py-1 border-b border-border last:border-0">
                  {ing.display}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {instructions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fremgangsmåte</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {instructions.map((step) => (
                <li key={step.number} className="text-sm leading-relaxed">
                  <span className="font-medium text-primary mr-2">{step.number}.</span>
                  {step.step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {recipe.sourceUrl && (
        <p className="text-xs text-muted-foreground">
          Kilde:{" "}
          <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {new URL(recipe.sourceUrl).hostname}
          </a>
        </p>
      )}
    </div>
  );
}
