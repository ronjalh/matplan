import { RecipeSearch } from "./recipe-search";

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold mb-1">
          Søk oppskrifter
        </h1>
        <p className="text-muted-foreground">
          Søk blant 685 000+ internasjonale oppskrifter. Filtrer på kosthold, kjøkken og tid.
        </p>
      </div>
      <RecipeSearch />
    </div>
  );
}
