"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMatpratRecipe } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, BookPlus, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import type { MatpratRecipe } from "@/data/matprat-recipes";

export function MatpratRecipeDetail({ recipe }: { recipe: MatpratRecipe }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (saving || saved) return;
    setSaving(true);
    setError(null);
    const result = await saveMatpratRecipe(recipe.id);
    setSaving(false);
    if (result.success) {
      setSaved(true);
      // Navigate to the new recipe after a brief moment
      setTimeout(() => router.push(`/oppskrifter/${result.id}`), 800);
    } else {
      if (result.error === "Du har allerede denne oppskriften" && "existingId" in result) {
        setError(result.error);
        setTimeout(() => router.push(`/oppskrifter/${result.existingId}`), 1500);
      } else {
        setError(result.error ?? "Noe gikk galt");
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/kalender" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold flex-1">
          {recipe.name}
        </h1>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || saved}
          className="gap-1"
        >
          {saved ? (
            <><Check className="w-4 h-4" /> Lagret!</>
          ) : saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Lagrer...</>
          ) : (
            <><BookPlus className="w-4 h-4" /> Lagre som min oppskrift</>
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" /> 4 porsjoner
        </span>
        {recipe.prepTimeMinutes && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {recipe.prepTimeMinutes} min
          </span>
        )}
        {recipe.cuisine && <Badge variant="secondary">{recipe.cuisine}</Badge>}
        {recipe.isVegetarian && (
          <Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)]">Vegetar</Badge>
        )}
        {recipe.isVegan && (
          <Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)]">Vegan</Badge>
        )}
        {recipe.isFishMeal && (
          <Badge className="bg-[var(--color-fish)]/10 text-[var(--color-fish)]">Fisk</Badge>
        )}
        <Badge variant="outline" className="text-muted-foreground">Utvalgt oppskrift</Badge>
      </div>

      {recipe.ingredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingredienser</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm py-1 border-b border-border last:border-0">
                  {ing.quantity} {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recipe.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fremgangsmåte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {recipe.instructions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
