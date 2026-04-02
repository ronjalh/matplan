"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  seedDefaultCategories,
  createCategory,
  updateCategory,
  addExpense,
  updateExpense,
  deleteExpense,
  deleteCategory,
  importShoppingListAsExpense,
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
  BarChart3,
  ShoppingCart,
  Pencil,
  Check,
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
  shoppingLists,
}: {
  categories: Category[];
  entries: Entry[];
  year: number;
  month: number;
  shoppingLists?: { id: number; name: string; weekStartDate: string }[];
}) {
  const router = useRouter();
  const [addingExpense, setAddingExpense] = useState<number | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatLimit, setEditCatLimit] = useState("");
  const [editCatColor, setEditCatColor] = useState("#7C9A7E");
  const [seeding, setSeeding] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [importingList, setImportingList] = useState(false);
  const [importCategoryId, setImportCategoryId] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

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

  async function handleSeed(type: string) {
    setSeeding(true);
    await seedDefaultCategories(type);
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
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Wallet className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-center mb-2 font-medium text-foreground">Start med SIFO referansebudsjett</p>
        <p className="text-center mb-6 text-sm max-w-md">
          Velg husstandstype for å få norske standardkategorier med anbefalte grenser.
          Du kan redigere alt etterpå.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Button onClick={() => handleSeed("single")} disabled={seeding} variant="outline" className="gap-2">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Enslig (~kr 10 800/mnd)
          </Button>
          <Button onClick={() => handleSeed("couple")} disabled={seeding} variant="outline" className="gap-2">
            Par (~kr 18 500/mnd)
          </Button>
          <Button onClick={() => handleSeed("family")} disabled={seeding} variant="outline" className="gap-2">
            Familie m/barn (~kr 28 000/mnd)
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Kilde: SIFO referansebudsjettet (OsloMet)</p>
        <Button variant="ghost" size="sm" onClick={() => setAddingCategory(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Eller lag helt egen
        </Button>
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="gap-1">
            <BarChart3 className="w-4 h-4" /> {showStats ? "Skjul" : "Statistikk"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportingList(!importingList)} className="gap-1">
            <ShoppingCart className="w-4 h-4" /> Handleliste
          </Button>
        </div>
      </div>

      {/* Import shopping list as expense */}
      {importingList && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Legg handleliste inn som utgift</p>
          {shoppingLists && shoppingLists.length > 0 ? (
            <div className="space-y-2">
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue=""
                onChange={(e) => {
                  const listId = parseInt(e.target.value);
                  if (!isNaN(listId)) setImportCategoryId(null);
                }}
                id="import-list-select"
              >
                <option value="">Velg handleliste...</option>
                {shoppingLists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={importCategoryId ?? ""}
                onChange={(e) => setImportCategoryId(parseInt(e.target.value) || null)}
              >
                <option value="">Velg budsjettategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {importError && <p className="text-sm text-destructive">{importError}</p>}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    const select = document.getElementById("import-list-select") as HTMLSelectElement;
                    const listId = parseInt(select.value);
                    if (!listId || !importCategoryId) return;
                    setImportError(null);
                    const result = await importShoppingListAsExpense(listId, importCategoryId);
                    if (!result.success) { setImportError(result.error ?? "Noe gikk galt"); return; }
                    setImportingList(false);
                  }}
                >
                  Legg til som utgift
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setImportingList(false)}>Avbryt</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ingen handlelister å importere.</p>
          )}
        </Card>
      )}

      {/* Statistics */}
      {showStats && categories.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Fordeling</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {categories.map((cat) => {
                const spent = categoryTotals.get(cat.id) ?? 0;
                const pctOfTotal = totalSpentOre > 0 ? (spent / totalSpentOre) * 100 : 0;
                return (
                  <div key={cat.id} className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color ?? "#7C9A7E" }} />
                    <span className="flex-1 min-w-0 truncate">{cat.name}</span>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pctOfTotal}%`, backgroundColor: cat.color ?? "#7C9A7E" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{Math.round(pctOfTotal)}%</span>
                    <span className="text-xs w-16 text-right">{formatKr(spent)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Totalt brukt</span>
            <span className="font-semibold">
              {totalSpentOre > 0 ? formatKr(totalSpentOre) : <span className="font-normal text-muted-foreground">Ingenting ennå</span>} / {formatKr(totalBudgetOre)}
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((totalSpentOre / totalBudgetOre) * 100, 100)}%`,
                backgroundColor: totalSpentOre / totalBudgetOre > 1 ? "var(--color-error)" : "var(--foreground)",
                opacity: totalSpentOre / totalBudgetOre > 1 ? 1 : 0.25,
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
        const isEditing = editingCategory === cat.id;

        return (
          <Card key={cat.id} className="group/card">
            <CardHeader className="py-3">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      className="h-8 text-sm flex-1"
                      autoFocus
                    />
                    <Input
                      type="number"
                      value={editCatLimit}
                      onChange={(e) => setEditCatLimit(e.target.value)}
                      placeholder="Grense kr/mnd"
                      className="h-8 text-sm w-28"
                    />
                    <input
                      type="color"
                      value={editCatColor}
                      onChange={(e) => setEditCatColor(e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7"
                      onClick={async () => {
                        const limit = parseFloat(editCatLimit);
                        if (editCatName.trim() && !isNaN(limit) && limit > 0) {
                          await updateCategory(cat.id, editCatName.trim(), limit, editCatColor);
                        }
                        setEditingCategory(null);
                      }}
                    >Lagre</Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingCategory(null)}>Avbryt</Button>
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-destructive hover:text-destructive"
                      onClick={async () => {
                        if (confirm(`Slette "${cat.name}" og alle utgifter?`)) {
                          await deleteCategory(cat.id);
                          setEditingCategory(null);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Slett kategori
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color ?? "#7C9A7E" }} />
                      <CardTitle className="text-sm">{cat.name}</CardTitle>
                      <button
                        onClick={() => {
                          setEditingCategory(cat.id);
                          setEditCatName(cat.name);
                          setEditCatLimit(String(cat.monthlyLimitOre / 100));
                          setEditCatColor(cat.color ?? "#7C9A7E");
                        }}
                        className="opacity-0 group-hover/card:opacity-100 transition-opacity text-muted-foreground hover:text-primary cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-medium">
                      {spent > 0 ? formatKr(spent) : <span className="text-muted-foreground font-normal">Ingen utgifter</span>} / {formatKr(cat.monthlyLimitOre)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(ratio * 100, 100)}%`,
                        backgroundColor: ratio > 1 && !cat.name.toLowerCase().includes("sparing")
                          ? "var(--color-error)"
                          : cat.color ?? "#7C9A7E",
                      }}
                    />
                  </div>
                </>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {/* Entries */}
              {catEntries.length > 0 && (
                <ul className="space-y-1 mb-2">
                  {catEntries.map((entry) => (
                    <ExpenseItem key={entry.id} entry={entry} year={year} month={month} />
                  ))}
                </ul>
              )}

              {/* Add expense inline */}
              {addingExpense === cat.id ? (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end mt-2">
                  <div className="flex-1">
                    <Input
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      placeholder="Beskrivelse"
                      className="h-8 text-sm"
                      autoComplete="off"
                      onKeyDown={(e) => e.key === "Enter" && handleAddExpense(cat.id)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="kr"
                    className="w-24 h-8 text-sm"
                    autoComplete="off"
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

      {/* Delete all */}
      {categories.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-destructive text-xs"
          onClick={async () => {
            if (!confirm("Slette hele budsjettet? Alle kategorier og utgifter fjernes. Du kan opprette et nytt etterpå.")) return;
            for (const cat of categories) {
              await deleteCategory(cat.id);
            }
          }}
        >
          <Trash2 className="w-3 h-3 mr-1" /> Slett hele budsjettet
        </Button>
      )}
    </div>
  );
}

function ExpenseItem({ entry, year, month }: { entry: Entry; year: number; month: number }) {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(entry.description ?? "");
  const [amount, setAmount] = useState(String(entry.amountOre / 100));
  const [date, setDate] = useState(entry.date);

  // Check if edited date is in a different month
  const editedMonth = date ? parseInt(date.split("-")[1]) : month;
  const editedYear = date ? parseInt(date.split("-")[0]) : year;
  const dateOutOfMonth = editing && (editedMonth !== month || editedYear !== year);

  function formatKr(ore: number) {
    return `kr ${(ore / 100).toLocaleString("nb-NO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  if (editing) {
    return (
      <li className="py-1 bg-muted/50 rounded-md px-2 space-y-1">
        {dateOutOfMonth && (
          <p className="text-xs text-[var(--color-warning)]">
            Denne datoen er i en annen måned — utgiften flyttes dit ved lagring.
          </p>
        )}
        <div className="flex gap-2 items-end">
        <Input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="h-7 text-xs flex-1"
          autoComplete="off"
          autoFocus
        />
        <Input
          type="number"
          autoComplete="off"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-7 text-xs w-20"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-7 text-xs w-28"
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={async () => {
            const amt = parseFloat(amount);
            if (desc.trim() && !isNaN(amt) && amt > 0) {
              await updateExpense(entry.id, desc.trim(), amt, date);
            }
            setEditing(false);
          }}
        >
          <Check className="w-3.5 h-3.5 text-primary" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditing(false)}>
          <X className="w-3.5 h-3.5" />
        </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="group flex items-center justify-between text-sm py-1">
      <button
        onClick={() => setEditing(true)}
        className="text-left flex-1 cursor-pointer hover:text-primary transition-colors"
      >
        <span className="text-muted-foreground text-xs mr-2">
          {entry.date.split("-").reverse().slice(0, 2).join(".")}
        </span>
        {entry.description}
      </button>
      <div className="flex items-center gap-1">
        <span>{formatKr(entry.amountOre)}</span>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary cursor-pointer"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => deleteExpense(entry.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </li>
  );
}
