"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  seedDefaultCategories,
  createCategory,
  addExpense,
  deleteExpense,
  deleteCategory,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Wallet,
  Loader2,
  X,
} from "lucide-react";

const monthNames = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];

interface Category {
  id: number;
  name: string;
  monthlyLimitOre: number;
  color: string | null;
}

interface Entry {
  id: number;
  categoryId: number;
  date: string;
  description: string | null;
  amountOre: number;
}

function formatKr(ore: number) {
  return `kr ${(ore / 100).toLocaleString("nb-NO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function BudgetView({
  categories,
  entries,
  year,
  month,
}: {
  categories: Category[];
  entries: Entry[];
  year: number;
  month: number;
}) {
  const router = useRouter();
  const [addingExpense, setAddingExpense] = useState<number | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Expense form state
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(
    `${year}-${String(month).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`
  );

  // Category form state
  const [catName, setCatName] = useState("");
  const [catLimit, setCatLimit] = useState("");
  const [catColor, setCatColor] = useState("#7C9A7E");

  function navigateMonth(offset: number) {
    let m = month + offset;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    router.push(`/budsjett?year=${y}&month=${m}`);
  }

  // Calculate totals per category
  const categoryTotals = new Map<number, number>();
  for (const entry of entries) {
    categoryTotals.set(entry.categoryId, (categoryTotals.get(entry.categoryId) ?? 0) + entry.amountOre);
  }

  const totalBudgetOre = categories.reduce((s, c) => s + c.monthlyLimitOre, 0);
  const totalSpentOre = entries.reduce((s, e) => s + e.amountOre, 0);

  async function handleSeed() {
    setSeeding(true);
    await seedDefaultCategories();
    setSeeding(false);
  }

  async function handleAddExpense(categoryId: number) {
    const amount = parseFloat(expAmount.replace(",", "."));
    if (!expDesc.trim() || isNaN(amount) || amount <= 0) return;
    await addExpense(categoryId, expDate, expDesc.trim(), amount);
    setExpDesc("");
    setExpAmount("");
    setAddingExpense(null);
  }

  async function handleAddCategory() {
    const limit = parseFloat(catLimit.replace(",", "."));
    if (!catName.trim() || isNaN(limit) || limit <= 0) return;
    await createCategory(catName.trim(), limit, catColor);
    setCatName("");
    setCatLimit("");
    setAddingCategory(false);
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Wallet className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-center mb-4">Ingen budsjettkategorier ennå.</p>
        <div className="flex gap-2">
          <Button onClick={handleSeed} disabled={seeding} className="gap-2">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
            Bruk norske standardkategorier
          </Button>
          <Button variant="outline" onClick={() => setAddingCategory(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Lag egen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[160px] text-center">
            {monthNames[month - 1]} {year}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Total summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Totalt brukt</span>
            <span className="font-semibold">
              {formatKr(totalSpentOre)} / {formatKr(totalBudgetOre)}
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((totalSpentOre / totalBudgetOre) * 100, 100)}%`,
                backgroundColor:
                  totalSpentOre / totalBudgetOre > 1 ? "var(--color-error)" :
                  totalSpentOre / totalBudgetOre > 0.85 ? "var(--color-warning)" :
                  "var(--color-success)",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Gjenstår: {formatKr(Math.max(totalBudgetOre - totalSpentOre, 0))}
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.map((cat) => {
        const spent = categoryTotals.get(cat.id) ?? 0;
        const ratio = cat.monthlyLimitOre > 0 ? spent / cat.monthlyLimitOre : 0;
        const catEntries = entries.filter((e) => e.categoryId === cat.id);

        return (
          <Card key={cat.id}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color ?? "#7C9A7E" }} />
                  <CardTitle className="text-sm">{cat.name}</CardTitle>
                </div>
                <span className="text-sm font-medium">
                  {formatKr(spent)} / {formatKr(cat.monthlyLimitOre)}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(ratio * 100, 100)}%`,
                    backgroundColor:
                      ratio > 1 ? "var(--color-error)" :
                      ratio > 0.85 ? "var(--color-warning)" :
                      cat.color ?? "var(--color-success)",
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Entries */}
              {catEntries.length > 0 && (
                <ul className="space-y-1 mb-2">
                  {catEntries.map((entry) => (
                    <li key={entry.id} className="group flex items-center justify-between text-sm py-1">
                      <div>
                        <span className="text-muted-foreground text-xs mr-2">
                          {entry.date.split("-").reverse().slice(0, 2).join(".")}
                        </span>
                        {entry.description}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{formatKr(entry.amountOre)}</span>
                        <button
                          onClick={() => deleteExpense(entry.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add expense inline */}
              {addingExpense === cat.id ? (
                <div className="flex gap-2 items-end mt-2">
                  <div className="flex-1">
                    <Input
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      placeholder="Beskrivelse"
                      className="h-8 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleAddExpense(cat.id)}
                      autoFocus
                    />
                  </div>
                  <Input
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="kr"
                    className="w-20 h-8 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAddExpense(cat.id)}
                  />
                  <Input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-32 h-8 text-sm"
                  />
                  <Button size="sm" className="h-8" onClick={() => handleAddExpense(cat.id)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setAddingExpense(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-xs"
                  onClick={() => setAddingExpense(cat.id)}
                >
                  <Plus className="w-3 h-3 mr-1" /> Legg til utgift
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Add category */}
      {addingCategory ? (
        <Card className="p-3">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Kategorinavn"
                className="h-8 text-sm flex-1"
                autoFocus
              />
              <Input
                value={catLimit}
                onChange={(e) => setCatLimit(e.target.value)}
                placeholder="Grense (kr/mnd)"
                className="h-8 text-sm w-32"
              />
              <input
                type="color"
                value={catColor}
                onChange={(e) => setCatColor(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddCategory}>Opprett</Button>
              <Button size="sm" variant="ghost" onClick={() => setAddingCategory(false)}>Avbryt</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={() => setAddingCategory(true)}>
          <Plus className="w-4 h-4" /> Ny kategori
        </Button>
      )}
    </div>
  );
}
