"use client";

import { useState } from "react";
import { generateShoppingList, toggleItem, deleteShoppingList, shareShoppingList } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Loader2, Trash2, Share2, Square, CheckSquare, Link2 } from "lucide-react";

interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  category: string | null;
  estimatedPriceOre: number | null;
}

interface ShoppingList {
  id: number;
  weekStartDate: string;
  items: ShoppingListItem[];
}

export function ShoppingListView({ list }: { list: ShoppingList | null }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function handleGenerate() {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateShoppingList();
      if (!result.success) {
        setError(result.error ?? "Noe gikk galt");
      }
    } catch {
      setError("Kunne ikke generere handleliste");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    if (!list || !confirm("Slette handlelisten?")) return;
    await deleteShoppingList(list.id);
  }

  async function handleToggle(itemId: number, checked: boolean) {
    await toggleItem(itemId, checked);
  }

  if (!list) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-center mb-4">
            Ingen handleliste ennå.
            <br />
            Generer en fra ukens matplan!
          </p>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Genererer...</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Generer handleliste</>
            )}
          </Button>
          {error && (
            <p className="text-sm text-destructive mt-3">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // Group items by category
  const categories = new Map<string, ShoppingListItem[]>();
  for (const item of list.items) {
    const cat = item.category ?? "Annet";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(item);
  }

  // Sort: unchecked first within each category
  for (const items of categories.values()) {
    items.sort((a, b) => Number(a.checked) - Number(b.checked));
  }

  const totalItems = list.items.length;
  const checkedItems = list.items.filter((i) => i.checked).length;

  // Price calculations
  const uncheckedItems = list.items.filter((i) => !i.checked);
  const totalPriceOre = uncheckedItems
    .filter((i) => i.estimatedPriceOre)
    .reduce((sum, i) => sum + i.estimatedPriceOre!, 0);
  const itemsWithoutPrice = uncheckedItems.filter((i) => !i.estimatedPriceOre).length;

  function formatKr(ore: number) {
    return `kr ${(ore / 100).toFixed(2).replace(".", ",")}`;
  }

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{checkedItems}</span> av {totalItems} varer huket av
          </div>
          {totalPriceOre > 0 && (
            <div className="text-sm">
              <span className="font-semibold text-foreground">{formatKr(totalPriceOre)}</span>
              <span className="text-muted-foreground"> estimert</span>
              {itemsWithoutPrice > 0 && (
                <span className="text-muted-foreground"> ({itemsWithoutPrice} uten pris)</span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const result = await shareShoppingList(list.id);
              if (result.success) {
                const url = `${window.location.origin}/shared/${result.token}`;
                setShareUrl(url);
                navigator.clipboard.writeText(url);
              }
            }}
            className="gap-1"
          >
            <Share2 className="w-4 h-4" />
            {shareUrl ? "Kopiert!" : "Del"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Oppdater"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%` }}
        />
      </div>

      {/* Items by category */}
      {Array.from(categories.entries()).map(([category, items]) => (
        <Card key={category}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleToggle(item.id, !item.checked)}
                    className={`w-full flex items-center gap-3 rounded-md px-2 py-2 text-sm text-left transition-colors cursor-pointer hover:bg-muted ${
                      item.checked ? "text-muted-foreground" : ""
                    }`}
                  >
                    {item.checked ? (
                      <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={`flex-1 ${item.checked ? "line-through" : ""}`}>
                      {item.quantity} {item.unit} {item.name}
                    </span>
                    {item.estimatedPriceOre && !item.checked && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatKr(item.estimatedPriceOre)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
