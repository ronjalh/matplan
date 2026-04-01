"use client";

import { useState } from "react";
import { searchSpoonacular, importSpoonacularRecipe } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Loader2, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";

const diets = [
  { value: "", label: "Alle" },
  { value: "vegetarian", label: "Vegetar" },
  { value: "vegan", label: "Vegan" },
  { value: "pescetarian", label: "Pescetarisk" },
];

const cuisines = [
  { value: "", label: "Alle kjøkken" },
  { value: "norwegian", label: "Norsk" },
  { value: "italian", label: "Italiensk" },
  { value: "mexican", label: "Meksikansk" },
  { value: "indian", label: "Indisk" },
  { value: "thai", label: "Thai" },
  { value: "japanese", label: "Japansk" },
  { value: "chinese", label: "Kinesisk" },
  { value: "greek", label: "Gresk" },
  { value: "french", label: "Fransk" },
  { value: "mediterranean", label: "Middelhavet" },
  { value: "korean", label: "Koreansk" },
  { value: "vietnamese", label: "Vietnamesisk" },
];

interface SearchResult {
  id: number;
  title: string;
  image: string;
}

export function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<number | null>(null);
  const [imported, setImported] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await searchSpoonacular({
        query: query.trim(),
        diet: diet || undefined,
        cuisine: cuisine || undefined,
      });
      setResults(res.results);
      setTotalResults(res.totalResults);
    } catch {
      setError("Søket feilet. Prøv igjen.");
    } finally {
      setSearching(false);
    }
  }

  async function handleImport(id: number) {
    if (importing) return;
    setImporting(id);
    setError(null);
    try {
      const result = await importSpoonacularRecipe(id);
      if (!result.success) {
        setError(result.error ?? "Noe gikk galt");
      } else {
        setImported((prev) => new Set(prev).add(id));
      }
    } catch {
      setError("Import feilet. Prøv igjen.");
    } finally {
      setImporting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk oppskrifter... (f.eks. pasta, curry, salat)"
            className="flex-1"
          />
          <Button type="submit" disabled={searching}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {diets.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {cuisines.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </form>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Results */}
      {totalResults > 0 && (
        <p className="text-sm text-muted-foreground">{totalResults} resultater</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((recipe) => {
          const isImported = imported.has(recipe.id);
          const isImporting = importing === recipe.id;

          return (
            <Card key={recipe.id} className="overflow-hidden p-0">
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-3 space-y-2">
                <h3 className="text-sm font-medium line-clamp-2">
                  {recipe.title}
                </h3>
                <div className="flex gap-2">
                  <Link
                    href={`/oppskrifter/search/${recipe.id}`}
                    className="flex-1"
                  >
                    <Button size="sm" variant="outline" className="w-full gap-1">
                      <Eye className="w-3.5 h-3.5" /> Vis
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant={isImported ? "secondary" : "default"}
                    disabled={isImporting || isImported}
                    onClick={() => handleImport(recipe.id)}
                    className="flex-1 gap-1"
                  >
                    {isImporting ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> ...</>
                    ) : isImported ? (
                      "Importert ✓"
                    ) : (
                      <><Download className="w-3.5 h-3.5" /> Importer</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {results.length === 0 && !searching && query && (
        <p className="text-center text-muted-foreground py-8">
          Ingen resultater for &quot;{query}&quot;. Prøv et annet søkeord.
        </p>
      )}

      <div className="pt-2">
        <Link href="/oppskrifter" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Tilbake til mine oppskrifter
        </Link>
      </div>
    </div>
  );
}
