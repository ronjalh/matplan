"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Fish,
  CalendarPlus,
  ShoppingCart,
} from "lucide-react";
import { addMeal, removeMeal, removeEvent, updateEvent } from "./actions";
import { AddEventDialog } from "./add-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";
import Link from "next/link";
import {
  formatShortDate,
  getISOWeekNumber,
  isToday,
  toISODate,
} from "@/lib/date-utils";

const mealTypes = [
  { key: "frokost" as const, label: "Frokost", icon: Sunrise },
  { key: "lunsj" as const, label: "Lunsj", icon: Sun },
  { key: "middag" as const, label: "Middag", icon: Sunset },
  { key: "kveldsmat" as const, label: "Kveldsmat", icon: Moon },
];

interface Meal {
  id: number;
  date: string;
  mealType: string;
  recipeId: number | null;
  freeText: string | null;
  recipeName: string | null;
  recipeServings: number | null;
  recipePrepTime: number | null;
  recipeIsVegetarian: boolean | null;
  recipeIsFishMeal: boolean | null;
}

interface CalEvent {
  id: number;
  date: string;
  title: string;
  eventType: string;
  startTime: string | null;
  endTime: string | null;
  linkedResourceType: string | null;
  linkedResourceId: number | null;
}

interface Recipe {
  id: number;
  name: string;
  servings: number;
  prepTimeMinutes: number | null;
  isVegetarian: boolean;
  isFishMeal: boolean;
}

interface WeekViewProps {
  days: string[];
  meals: Meal[];
  events: CalEvent[];
  allRecipes: Recipe[];
}

export function WeekView({ days, meals, events, allRecipes }: WeekViewProps) {
  const router = useRouter();
  const dates = days.map((d) => new Date(d));
  const weekNum = getISOWeekNumber(dates[0]);

  const [addingMeal, setAddingMeal] = useState<{ date: string; mealType: string } | null>(null);
  const [addingEvent, setAddingEvent] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);

  function navigateWeek(offset: number) {
    const d = new Date(dates[0]);
    d.setDate(d.getDate() + offset * 7);
    router.push(`/kalender?week=${toISODate(d)}`);
  }

  function getMeal(date: string, mealType: string) {
    return meals.find((m) => m.date === date && m.mealType === mealType);
  }

  function getMealsForDate(date: string) {
    return meals.filter((m) => m.date === date);
  }

  function getEventsForDate(date: string) {
    return events.filter((e) => e.date === date);
  }

  // Weekly stats
  const fishCount = meals.filter((m) => m.recipeIsFishMeal).length;

  async function handleAddMeal(recipeId: number) {
    if (!addingMeal) return;
    await addMeal(addingMeal.date, addingMeal.mealType as any, recipeId, null);
    setAddingMeal(null);
  }

  async function handleRemoveMeal(mealId: number) {
    await removeMeal(mealId);
  }

  async function handleRemoveEvent(eventId: number) {
    await removeEvent(eventId);
  }

  // Count daily meals for mini 8-om-dagen indicator
  function getDayMealCount(date: string) {
    return meals.filter((m) => m.date === date).length;
  }

  return (
    <div className="space-y-4">
      {/* Week navigation + stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/kalender")}>
            I dag
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold ml-2">Uke {weekNum}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className={`flex items-center gap-1.5 ${fishCount >= 2 ? "text-[var(--color-fish)]" : "text-muted-foreground"}`}>
            <Fish className="w-4 h-4" />
            {fishCount}/2–3 fisk
            {fishCount >= 2 && " ✓"}
          </span>
          <span className="text-muted-foreground">
            {meals.length} måltider planlagt
          </span>
        </div>
      </div>

      {/* Meal picker */}
      {addingMeal && (
        <Card className="p-4 border-primary">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">
              Velg oppskrift — {mealTypes.find((m) => m.key === addingMeal.mealType)?.label}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setAddingMeal(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {allRecipes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Du har ingen oppskrifter ennå. Lag en under Oppskrifter-fanen.
            </p>
          ) : (
            <div className="grid gap-1 max-h-60 overflow-y-auto">
              {allRecipes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleAddMeal(r.id)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-left hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>{r.name}</span>
                    {r.isFishMeal && <Fish className="w-3 h-3 text-[var(--color-fish)]" />}
                    {r.isVegetarian && <span className="text-[var(--color-success)] text-xs">V</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {r.prepTimeMinutes && `${r.prepTimeMinutes} min`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Event dialog */}
      {addingEvent && (
        <AddEventDialog date={addingEvent} onClose={() => setAddingEvent(null)} />
      )}

      {/* Edit event dialog */}
      {editingEvent && (
        <EditEventDialog event={editingEvent} onClose={() => setEditingEvent(null)} />
      )}

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          const dateStr = toISODate(date);
          const today = isToday(date);
          const dayEvents = getEventsForDate(dateStr);
          const dayMealCount = getDayMealCount(dateStr);

          return (
            <div
              key={dateStr}
              className={`min-h-[300px] rounded-lg border p-2 space-y-1 ${
                today ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              {/* Day header */}
              <div className={`flex items-center justify-between pb-1 border-b border-border`}>
                <span className={`text-xs font-medium ${today ? "text-primary" : "text-muted-foreground"}`}>
                  {formatShortDate(date)}
                </span>
                {dayMealCount > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(dayMealCount, 4) }, (_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                    ))}
                  </div>
                )}
              </div>

              {/* Meal slots */}
              {mealTypes.map(({ key, label, icon: Icon }) => {
                const meal = getMeal(dateStr, key);

                if (meal) {
                  return (
                    <div
                      key={key}
                      className="group relative rounded-md bg-primary/10 px-2 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-1">
                        <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">
                          {meal.recipeName ?? meal.freeText ?? label}
                        </span>
                      </div>
                      {meal.recipeIsFishMeal && (
                        <Fish className="w-3 h-3 text-[var(--color-fish)] absolute top-1 right-5" />
                      )}
                      <button
                        onClick={() => handleRemoveMeal(meal.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={key}
                    onClick={() => setAddingMeal({ date: dateStr, mealType: key })}
                    className="w-full flex items-center gap-1 rounded-md border border-dashed border-border/50 px-2 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <Plus className="w-3 h-3" />
                  </button>
                );
              })}

              {/* Events */}
              {dayEvents.map((event) => {
                const hasLink = event.linkedResourceType === "shoppingList" && event.linkedResourceId;
                const eventContent = (
                  <div
                    key={event.id}
                    onClick={() => !hasLink && setEditingEvent(event)}
                    className={`group relative rounded-md px-2 py-1 text-xs border-l-2 hover:bg-muted cursor-pointer`}
                    style={{
                      borderLeftColor:
                        event.eventType === "aktivitet" ? "var(--color-fish)" :
                        event.eventType === "avtale" ? "var(--color-terracotta)" :
                        event.eventType === "paamminnelse" ? "var(--color-warning)" :
                        "var(--muted-foreground)",
                    }}
                  >
                    <span className="truncate block">{event.title}</span>
                    {event.startTime && (
                      <span className="text-muted-foreground">{event.startTime}{event.endTime && `–${event.endTime}`}</span>
                    )}
                    {hasLink && (
                      <ShoppingCart className="w-3 h-3 text-primary absolute top-1 right-5" />
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveEvent(event.id); }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );

                if (hasLink) {
                  return (
                    <Link key={event.id} href={`/handleliste?id=${event.linkedResourceId}`}>
                      {eventContent}
                    </Link>
                  );
                }
                return eventContent;
              })}

              {/* Add event button */}
              <button
                onClick={() => setAddingEvent(dateStr)}
                className="w-full flex items-center justify-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-3 h-3" />
                <span>Hendelse</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
