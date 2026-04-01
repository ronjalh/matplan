"use client";

import { createRecipe } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IngredientEditor } from "@/components/recipe/ingredient-editor";
import { useState, useRef } from "react";
import { ChefHat } from "lucide-react";

const cuisines = [
  "Norsk",
  "Italiensk",
  "Meksikansk",
  "Indisk",
  "Thai",
  "Japansk",
  "Kinesisk",
  "Gresk",
  "Fransk",
  "Amerikansk",
  "Midtøsten",
  "Koreansk",
  "Vietnamesisk",
  "Etiopisk",
  "Annet",
];

export function RecipeForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await createRecipe(formData);
      if (!result.success) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-primary" />
          Ny oppskrift
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Navn *</Label>
            <Input
              id="name"
              name="name"
              placeholder="F.eks. Laksemiddag med grønnsaker"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Kort beskrivelse</Label>
            <Input
              id="description"
              name="description"
              placeholder="Enkel og sunn hverdagsmiddag"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="servings">Porsjoner</Label>
              <Input
                id="servings"
                name="servings"
                type="number"
                defaultValue={4}
                min={1}
                max={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepTimeMinutes">Tid (minutter)</Label>
              <Input
                id="prepTimeMinutes"
                name="prepTimeMinutes"
                type="number"
                defaultValue={60}
                min={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuisine">Kjøkken</Label>
            <select
              id="cuisine"
              name="cuisine"
              defaultValue=""
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Velg kjøkken...</option>
              {cuisines.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Merking</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="isVegetarian" className="rounded" />
                Vegetar
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="isVegan" className="rounded" />
                Vegan
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="isGlutenFree" className="rounded" />
                Glutenfri
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="isDairyFree" className="rounded" />
                Melkefri
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="isNutFree" className="rounded" />
                Nøttefri
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ingredienser</Label>
            <IngredientEditor />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Fremgangsmåte</Label>
            <Textarea
              id="instructions"
              name="instructions"
              placeholder={"1. Forvarm ovnen til 200°C\n2. Legg laksen i en ildfast form\n3. ..."}
              rows={6}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Lagrer..." : "Lagre oppskrift"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
