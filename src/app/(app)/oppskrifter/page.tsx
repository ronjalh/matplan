import { getRecipes } from "./actions";
import { RecipeTabs } from "./recipe-tabs";

export default async function OppskrifterPage() {
  const recipes = await getRecipes();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-1">
          Oppskrifter
        </h1>
        <p className="text-muted-foreground">
          Dine oppskrifter og utforsk tusenvis av nye.
        </p>
      </div>
      <RecipeTabs recipes={recipes} />
    </div>
  );
}
