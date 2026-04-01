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

export function RecipeForm() {
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setPending(true);
    try {
      await createRecipe(formData);
      formRef.current?.reset();
    } catch (e) {
      console.error(e);
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
                placeholder="30"
                min={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuisine">Kjøkken</Label>
            <Input
              id="cuisine"
              name="cuisine"
              placeholder="F.eks. Norsk, Italiensk, Indisk"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="isVegetarian" className="rounded" />
              Vegetar
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="isVegan" className="rounded" />
              Vegan
            </label>
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

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Lagrer..." : "Lagre oppskrift"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
