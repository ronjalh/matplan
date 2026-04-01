"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Square, CheckSquare } from "lucide-react";
import { useState } from "react";

interface Item {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  category: string | null;
  estimatedPriceOre: number | null;
}

export function SharedShoppingList({ items: initialItems, token }: { items: Item[]; token: string }) {
  const [items, setItems] = useState(initialItems);

  async function handleToggle(itemId: number) {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i))
    );

    // Sync to server
    await fetch(`/api/shared/${token}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
  }

  // Group by category
  const categories = new Map<string, Item[]>();
  for (const item of items) {
    const cat = item.category ?? "Annet";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(item);
  }

  for (const catItems of categories.values()) {
    catItems.sort((a, b) => Number(a.checked) - Number(b.checked));
  }

  const total = items.length;
  const checked = items.filter((i) => i.checked).length;

  function formatKr(ore: number) {
    return `kr ${(ore / 100).toFixed(2).replace(".", ",")}`;
  }

  const uncheckedPrice = items
    .filter((i) => !i.checked && i.estimatedPriceOre)
    .reduce((sum, i) => sum + i.estimatedPriceOre!, 0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{checked}</span> av {total} varer huket av
        {uncheckedPrice > 0 && (
          <span> · {formatKr(uncheckedPrice)} gjenstår</span>
        )}
      </div>

      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${total > 0 ? (checked / total) * 100 : 0}%` }}
        />
      </div>

      {Array.from(categories.entries()).map(([category, catItems]) => (
        <Card key={category}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-0.5">
              {catItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`w-full flex items-center gap-3 rounded-md px-2 py-2 text-sm text-left transition-colors cursor-pointer hover:bg-muted ${
                      item.checked ? "text-muted-foreground" : ""
                    }`}
                  >
                    {item.checked ? (
                      <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span className={`flex-1 ${item.checked ? "line-through" : ""}`}>
                      {item.quantity} {item.unit} {item.name}
                    </span>
                    {item.estimatedPriceOre && !item.checked && (
                      <span className="text-xs text-muted-foreground">
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
    </div>
  );
}
