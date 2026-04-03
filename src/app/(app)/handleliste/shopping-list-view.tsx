"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toISODate } from "@/lib/date-utils";
import {
  generateShoppingList,
  toggleItem,
  deleteShoppingList,
  shareShoppingList,
  updateItemPrice,
  updateItemQuantity,
  createEmptyList,
  renameList,
  addItem,
  removeItem,
  addShoppingTrip,
  fetchPricesForList,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart, Loader2, Trash2, Share2, Square, CheckSquare,
  Pencil, Check, X, Plus, CalendarPlus, Eye, EyeOff, Zap, ZapOff,
} from "lucide-react";

interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  category: string | null;
  estimatedPriceOre: number | null;
  priceSource: string | null;
  priceStore: string | null;
}

interface ShoppingList {
  id: number;
  name: string;
  weekStartDate: string;
  items: ShoppingListItem[];
}

interface ListSummary {
  id: number;
  name: string;
  weekStartDate: string;
  createdAt: string;
}

export function ShoppingListView({
  list,
  allLists,
  activeListId,
}: {
  list: ShoppingList | null;
  allLists: ListSummary[];
  activeListId?: number;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>("alle");

  // Reset share button when switching lists
  useEffect(() => {
    setShareUrl(null);
    setStoreFilter("alle");
    setEditingName(false);
    setAddingToCalendar(false);
    setAddingItem(false);
  }, [activeListId]);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(list?.name ?? "");
  const [addingItem, setAddingItem] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [tripDate, setTripDate] = useState(toISODate(new Date()));
  const [tripTime, setTripTime] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("stk");
  const [showPrices, setShowPrices] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("matplan-show-prices");
    return stored !== null ? stored === "true" : true;
  });
  const [autoPrices, setAutoPrices] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("matplan-auto-prices");
    return stored !== null ? stored === "true" : true;
  });
  const [fetchingPrices, setFetchingPrices] = useState(false);

  function toggleShowPrices() {
    const next = !showPrices;
    setShowPrices(next);
    localStorage.setItem("matplan-show-prices", String(next));
  }

  async function toggleAutoPrices() {
    const next = !autoPrices;
    setAutoPrices(next);
    localStorage.setItem("matplan-auto-prices", String(next));

    // If turning ON and there are items without prices, fetch them
    if (next && list) {
      const itemsWithoutPrice = list.items.filter((i) => !i.estimatedPriceOre && !i.checked);
      if (itemsWithoutPrice.length > 0) {
        setFetchingPrices(true);
        await fetchPricesForList(list.id);
        setFetchingPrices(false);
        router.refresh();
      }
    }
  }

  async function handleGenerate() {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateShoppingList(undefined, !autoPrices);
      if (!result.success) {
        setError(result.error ?? "Noe gikk galt");
      }
    } catch {
      setError("Kunne ikke generere handleliste");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateEmpty() {
    const result = await createEmptyList();
    if (result.success) router.push(`/handleliste?id=${result.id}`);
  }

  async function handleDelete() {
    if (!list || !confirm("Slette handlelisten?")) return;
    await deleteShoppingList(list.id);
    router.push("/handleliste");
    router.refresh();
  }

  async function handleToggle(itemId: number, checked: boolean) {
    await toggleItem(itemId, checked);
  }

  async function handleRenameSave() {
    if (!list || !nameInput.trim()) return;
    await renameList(list.id, nameInput.trim());
    setEditingName(false);
  }

  async function handleAddItem() {
    if (!list || !newItemName.trim()) return;
    const qty = parseFloat(newItemQty) || 1;
    await addItem(list.id, newItemName.trim(), qty, newItemUnit);
    setNewItemName("");
    setNewItemQty("");
    setAddingItem(false);
  }

  function formatKr(ore: number) {
    return `kr ${(ore / 100).toFixed(2).replace(".", ",")}`;
  }

  // Empty state
  if (!list && allLists.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-center mb-4">Ingen handlelister ennå.</p>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              Generer fra ukesplan
            </Button>
            <Button variant="outline" onClick={handleCreateEmpty} className="gap-2">
              <Plus className="w-4 h-4" /> Tom handleliste
            </Button>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mt-3 flex items-center justify-between gap-2">
              <span>{error}</span>
              <Link href="/kalender" className="shrink-0 text-xs underline hover:no-underline">
                Gå til kalender →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!list) return null;

  // Get unique stores for filter
  const stores = [...new Set(
    list.items
      .map((i) => i.priceStore)
      .filter((s): s is string => !!s && s !== "Egendefinert")
  )].sort();

  // Split checked and unchecked
  const uncheckedItemsList = list.items.filter((i) => !i.checked);
  const checkedItemsList = list.items.filter((i) => i.checked);

  // Group unchecked items by category
  const categories = new Map<string, ShoppingListItem[]>();
  for (const item of uncheckedItemsList) {
    const cat = item.category ?? "Annet";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(item);
  }

  const totalItems = list.items.length;
  const checkedCount = checkedItemsList.length;
  const totalPriceOre = uncheckedItemsList
    .filter((i) => i.estimatedPriceOre)
    .reduce((sum, i) => sum + i.estimatedPriceOre!, 0);
  const itemsWithoutPrice = uncheckedItemsList.filter((i) => !i.estimatedPriceOre).length;

  return (
    <div className="space-y-4">
      {/* List selector */}
      {allLists.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {allLists.map((l) => (
            <button
              key={l.id}
              onClick={() => router.push(`/handleliste?id=${l.id}`)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                l.id === activeListId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {l.name || `Uke ${l.weekStartDate}`}
            </button>
          ))}
        </div>
      )}

      {/* Actions row */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating} className="gap-1">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          Ny fra ukesplan
        </Button>
        <Button variant="outline" size="sm" onClick={handleCreateEmpty} className="gap-1">
          <Plus className="w-4 h-4" /> Tom liste
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 flex items-center justify-between gap-2">
          <span>{error}</span>
          <Link href="/kalender" className="shrink-0 text-xs underline hover:no-underline">
            Gå til kalender →
          </Link>
        </div>
      )}

      {/* List name (editable) */}
      <div className="flex items-center gap-2 flex-wrap">
        {editingName ? (
          <>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameSave()}
              className="h-8 text-sm max-w-[200px]"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleRenameSave} className="h-8 w-8 p-0">
              <Check className="w-4 h-4 text-primary" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingName(false)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">{list.name}</h2>
            <button onClick={() => { setNameInput(list.name); setEditingName(true); }} className="text-muted-foreground hover:text-primary cursor-pointer">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        <div className="flex-1" />
        <Button
          variant="outline" size="sm"
          onClick={async () => {
            const result = await shareShoppingList(list.id);
            if (result.success) {
              const url = `${window.location.origin}/shared/${result.token}`;
              setShareUrl(url);
              navigator.clipboard.writeText(url);
              setTimeout(() => setShareUrl(null), 2000);
            }
          }}
          className="gap-1"
        >
          <Share2 className="w-4 h-4" /> {shareUrl ? "Kopiert!" : "Del"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setAddingToCalendar(!addingToCalendar)} className="gap-1">
          <CalendarPlus className="w-4 h-4" /> Handletur
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Add shopping trip to calendar */}
      {addingToCalendar && (
        <Card className="p-3">
          <p className="text-sm font-medium mb-2">Legg handletur i kalender</p>
          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Dato</label>
              <Input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Kl. (valgfritt)</label>
              <Input
                type="time"
                value={tripTime}
                onChange={(e) => setTripTime(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <Button
              size="sm"
              className="h-8"
              onClick={async () => {
                const result = await addShoppingTrip(list.id, tripDate, tripTime || undefined);
                if (!result.success) { setError(result.error ?? "Noe gikk galt"); return; }
                setAddingToCalendar(false);
              }}
            >
              Legg til
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setAddingToCalendar(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Store filter — disabled for now, needs better implementation */}
      {false && stores.length > 1 && (
        <div className="flex flex-wrap gap-1.5 items-center">
        </div>
      )}

      {/* Stats + toggles */}
      <div className="flex items-center justify-between text-sm">
        <div className="space-y-0.5">
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{checkedCount}</span> av {totalItems} huket av
          </div>
          {showPrices && totalPriceOre > 0 && (
            <div>
              <span className="font-semibold">{formatKr(totalPriceOre)}</span>
              <span className="text-muted-foreground"> estimert</span>
              {itemsWithoutPrice > 0 && <span className="text-muted-foreground"> ({itemsWithoutPrice} uten pris)</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleShowPrices}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer ${showPrices ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title={showPrices ? "Skjul priser" : "Vis priser"}
          >
            {showPrices ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Priser
          </button>
          <button
            onClick={toggleAutoPrices}
            disabled={fetchingPrices}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer ${autoPrices ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title={autoPrices ? "Slå av auto-priser ved generering" : "Slå på auto-priser — henter priser for varer uten pris"}
          >
            {fetchingPrices ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : autoPrices ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
            {fetchingPrices ? "Henter..." : "Auto-pris"}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }} />
      </div>

      {/* Items by category — "Annet" always last */}
      {Array.from(categories.entries())
        .sort(([a], [b]) => a === "Annet" ? 1 : b === "Annet" ? -1 : 0)
        .map(([category, items]) => (
        <Card key={category}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{category}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-0.5">
              {items.map((item) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onRemove={removeItem}
                  formatKr={formatKr}
                  showPrices={showPrices}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {/* Completed items */}
      {checkedItemsList.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground py-2">
            <Check className="w-4 h-4 text-primary" />
            <span>Fullført ({checkedItemsList.length})</span>
          </summary>
          <Card className="mt-2 opacity-75">
            <CardContent className="pt-4">
              <ul className="space-y-0.5">
                {checkedItemsList.map((item) => (
                  <ShoppingItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onRemove={removeItem}
                    formatKr={formatKr}
                    showPrices={showPrices}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        </details>
      )}

      {/* Add item */}
      {addingItem ? (
        <Card className="p-3">
          <div className="flex gap-2">
            <Input
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              placeholder="Ant."
              type="number"
              className="w-16 h-8 text-sm"
            />
            <select
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs h-8"
            >
              {["stk","g","kg","dl","l","ml","ss","ts","pk"].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              placeholder="Varenavn"
              className="flex-1 h-8 text-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleAddItem} className="h-8">Legg til</Button>
            <Button size="sm" variant="ghost" onClick={() => setAddingItem(false)} className="h-8"><X className="w-4 h-4" /></Button>
          </div>
        </Card>
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={() => setAddingItem(true)}>
          <Plus className="w-4 h-4" /> Legg til vare
        </Button>
      )}
    </div>
  );
}

function ShoppingItem({
  item,
  onToggle,
  onRemove,
  formatKr,
  showPrices = true,
}: {
  item: ShoppingListItem;
  onToggle: (id: number, checked: boolean) => void;
  onRemove: (id: number) => void;
  formatKr: (ore: number) => string;
  showPrices?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editingQty, setEditingQty] = useState(false);
  const [qtyInput, setQtyInput] = useState(String(item.quantity));
  const [priceInput, setPriceInput] = useState(
    item.estimatedPriceOre ? (item.estimatedPriceOre / 100).toFixed(2).replace(".", ",") : ""
  );
  const [storeInput, setStoreInput] = useState(item.priceStore === "Egendefinert" ? "" : item.priceStore ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSavePrice() {
    const parsed = parseFloat(priceInput.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) return;
    setSaving(true);
    await updateItemPrice(item.id, parsed, storeInput || undefined);
    setSaving(false);
    setEditing(false);
  }

  async function handleSaveQty() {
    const parsed = parseFloat(qtyInput.replace(",", "."));
    if (isNaN(parsed) || parsed <= 0) return;
    await updateItemQuantity(item.id, parsed);
    setEditingQty(false);
  }

  if (editing) {
    return (
      <li className="rounded-md px-2 py-2 bg-muted/50 space-y-2">
        <span className="text-sm">{item.quantity} {item.unit} {item.name}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">kr</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSavePrice()}
            className="w-20 h-7 text-xs"
            autoComplete="off"
            autoFocus
          />
          <Input
            value={storeInput}
            onChange={(e) => setStoreInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSavePrice()}
            placeholder="Butikk"
            className="w-24 h-7 text-xs"
            autoComplete="off"
          />
          <Button size="sm" variant="ghost" onClick={handleSavePrice} disabled={saving} className="h-7 w-7 p-0">
            <Check className="w-3.5 h-3.5 text-primary" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 w-7 p-0">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="group">
      <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors">
        <button onClick={() => onToggle(item.id, !item.checked)} className="shrink-0 cursor-pointer">
          {item.checked ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
        </button>
        <span className={`flex-1 min-w-0 ${item.checked ? "text-muted-foreground line-through" : ""}`}>
          {editingQty ? (
            <span className="inline-flex items-center gap-1">
              <Input
                type="number"
                step="any"
                min="0.1"
                value={qtyInput}
                onChange={(e) => setQtyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveQty(); if (e.key === "Escape") setEditingQty(false); }}
                onBlur={handleSaveQty}
                className="w-16 h-6 text-xs inline"
                autoFocus
              />
              {item.unit} {item.name}
            </span>
          ) : (
            <span>
              <button
                onClick={() => !item.checked && setEditingQty(true)}
                className="hover:text-primary cursor-pointer"
                title="Klikk for å endre mengde"
              >
                {item.quantity} {item.unit}
              </button>
              {" "}{item.name}
            </span>
          )}
        </span>
        {!item.checked && (
          <div className="flex items-center gap-1.5 shrink-0">
            {showPrices && (
              item.estimatedPriceOre ? (
                <span className={`text-xs ${item.estimatedPriceOre > 25000 ? "text-[var(--color-warning)]" : "text-muted-foreground"}`}>
                  {item.estimatedPriceOre > 25000 && "⚠ "}
                  {formatKr(item.estimatedPriceOre)}
                  {item.priceSource && (
                    <span className="text-[10px] ml-1 opacity-70">
                      {item.priceSource}{item.priceStore ? ` — ${item.priceStore}` : ""}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/50">Ingen pris</span>
              )
            )}
            {showPrices && (
              <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-primary">
                <Pencil className="w-3 h-3" />
              </button>
            )}
            <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
