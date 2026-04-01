"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
}

interface IngredientEditorProps {
  initial?: IngredientInput[];
  name?: string; // hidden input name for form submission
}

const commonUnits = ["g", "kg", "dl", "l", "ml", "ss", "ts", "stk", "pk", "fedd", "klype"];

export function IngredientEditor({
  initial = [],
  name = "ingredients",
}: IngredientEditorProps) {
  const [ingredients, setIngredients] = useState<IngredientInput[]>(initial);
  const [currentName, setCurrentName] = useState("");
  const [currentQty, setCurrentQty] = useState("");
  const [currentUnit, setCurrentUnit] = useState("g");

  function addIngredient() {
    const trimmed = currentName.trim();
    const qty = parseFloat(currentQty);
    if (!trimmed || isNaN(qty) || qty <= 0) return;

    setIngredients([...ingredients, { name: trimmed, quantity: qty, unit: currentUnit }]);
    setCurrentName("");
    setCurrentQty("");
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  }

  return (
    <div className="space-y-3">
      {/* Hidden input with JSON for form submission */}
      <input type="hidden" name={name} value={JSON.stringify(ingredients)} />

      {/* Ingredient list */}
      {ingredients.length > 0 && (
        <ul className="space-y-1">
          {ingredients.map((ing, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
            >
              <span>
                {ing.quantity} {ing.unit} {ing.name}
              </span>
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="text-muted-foreground hover:text-destructive ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add ingredient row */}
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Mengde"
          value={currentQty}
          onChange={(e) => setCurrentQty(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20"
          min={0}
          step="any"
        />
        <select
          value={currentUnit}
          onChange={(e) => setCurrentUnit(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
        >
          {commonUnits.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <Input
          placeholder="Ingrediens (f.eks. laks)"
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addIngredient}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Skriv mengde, velg enhet, skriv ingrediensnavn og trykk Enter eller +
      </p>
    </div>
  );
}
