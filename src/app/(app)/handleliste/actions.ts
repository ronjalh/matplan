"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import {
  mealPlan,
  recipes,
  recipeIngredients,
  shoppingLists,
  shoppingListItems,
  sharedLinks,
  calendarEvents,
  householdMembers,
} from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getMonday, getWeekDays, toISODate, getISOWeekNumber } from "@/lib/date-utils";
import { findBestPrice } from "@/price-api/kassalapp";

async function getHouseholdId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ikke logget inn");
  const membership = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, session.user.id),
  });
  if (!membership) throw new Error("Ingen husstand funnet");
  return membership.householdId;
}

export async function getAllShoppingLists() {
  const householdId = await getHouseholdId();

  return db.query.shoppingLists.findMany({
    where: eq(shoppingLists.householdId, householdId),
    orderBy: [desc(shoppingLists.createdAt)],
  });
}

export async function getShoppingList(listId?: number) {
  const householdId = await getHouseholdId();

  const list = listId
    ? await db.query.shoppingLists.findFirst({
        where: and(eq(shoppingLists.id, listId), eq(shoppingLists.householdId, householdId)),
      })
    : await db.query.shoppingLists.findFirst({
        where: eq(shoppingLists.householdId, householdId),
        orderBy: [desc(shoppingLists.createdAt)],
      });

  if (!list) return null;

  const items = await db.query.shoppingListItems.findMany({
    where: eq(shoppingListItems.shoppingListId, list.id),
  });

  return { ...list, items };
}

export async function generateShoppingList(weekStartDate?: string) {
  const householdId = await getHouseholdId();

  // Get week dates
  const baseDate = weekStartDate ? new Date(weekStartDate) : new Date();
  const days = getWeekDays(baseDate);
  const startDate = toISODate(days[0]);
  const endDate = toISODate(days[6]);

  // Get all meals for the week
  const weekMeals = await db
    .select({
      recipeId: mealPlan.recipeId,
      servingsOverride: mealPlan.servingsOverride,
      recipeServings: recipes.servings,
    })
    .from(mealPlan)
    .leftJoin(recipes, eq(mealPlan.recipeId, recipes.id))
    .where(
      and(
        eq(mealPlan.householdId, householdId),
        gte(mealPlan.date, startDate),
        lte(mealPlan.date, endDate)
      )
    );

  // Get ingredients for all recipes
  const recipeIds = [...new Set(weekMeals.filter((m) => m.recipeId).map((m) => m.recipeId!))];

  if (recipeIds.length === 0) {
    return { success: false, error: "Ingen måltider planlagt denne uken" };
  }

  // Fetch all ingredients for planned recipes
  const allIngredients: {
    recipeId: number;
    quantity: number;
    unit: string;
    originalText: string | null;
  }[] = [];

  for (const recipeId of recipeIds) {
    const ings = await db.query.recipeIngredients.findMany({
      where: eq(recipeIngredients.recipeId, recipeId),
    });
    allIngredients.push(...ings.map((i) => ({
      recipeId: i.recipeId,
      quantity: i.quantity,
      unit: i.unit,
      originalText: i.originalText,
    })));
  }

  // Calculate multipliers (how many times each recipe appears, with servings adjustment)
  const recipeMultipliers = new Map<number, number>();
  for (const meal of weekMeals) {
    if (!meal.recipeId) continue;
    const current = recipeMultipliers.get(meal.recipeId) ?? 0;
    const servings = meal.servingsOverride ?? meal.recipeServings ?? 4;
    const baseServings = meal.recipeServings ?? 4;
    const multiplier = servings / baseServings;
    recipeMultipliers.set(meal.recipeId, current + multiplier);
  }

  // Aggregate ingredients: merge same name+unit
  const aggregated = new Map<string, { name: string; quantity: number; unit: string }>();

  for (const ing of allIngredients) {
    const multiplier = recipeMultipliers.get(ing.recipeId) ?? 1;
    // Extract just the ingredient name from originalText
    const name = extractIngredientName(ing.originalText ?? "", ing.quantity, ing.unit);
    const key = `${name.toLowerCase()}|${ing.unit}`;

    const existing = aggregated.get(key);
    if (existing) {
      existing.quantity += ing.quantity * multiplier;
    } else {
      aggregated.set(key, {
        name,
        quantity: ing.quantity * multiplier,
        unit: ing.unit,
      });
    }
  }

  // Generate list name
  const listName = await generateListName(householdId);

  // Create shopping list
  const [list] = await db
    .insert(shoppingLists)
    .values({
      householdId,
      name: listName,
      weekStartDate: startDate,
      generatedFromMealPlan: true,
    })
    .returning();

  // Fetch prices from Kassalapp (best-effort, don't block on failures)
  const items = Array.from(aggregated.values());
  const priceMap = new Map<string, { priceOre: number; productName: string; store: string }>();

  // Fetch prices in parallel (max 10 at a time to respect rate limit)
  const batchSize = 10;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(async (item) => {
        const result = await findBestPrice(item.name);
        if (result) {
          priceMap.set(item.name, {
            priceOre: result.priceOre,
            productName: result.product.name,
            store: result.product.store.name,
          });
        }
      })
    );
  }

  // Insert aggregated items with prices and product info
  if (items.length > 0) {
    await db.insert(shoppingListItems).values(
      items.map((item) => {
        const price = priceMap.get(item.name);
        return {
          shoppingListId: list.id,
          name: item.name,
          quantity: roundQuantity(item.quantity, item.unit),
          unit: item.unit,
          checked: false,
          category: guessCategory(item.name),
          estimatedPriceOre: price?.priceOre ?? null,
          priceSource: price?.productName ?? null,
          priceStore: price?.store ?? null,
        };
      })
    );
  }

  revalidatePath("/handleliste");
  return { success: true, id: list.id, itemCount: items.length };
}

export async function toggleItem(itemId: number, checked: boolean) {
  await db
    .update(shoppingListItems)
    .set({ checked })
    .where(eq(shoppingListItems.id, itemId));
  revalidatePath("/handleliste");
  return { success: true };
}

export async function updateItemPrice(itemId: number, priceKr: number) {
  const priceOre = Math.round(priceKr * 100);
  await db
    .update(shoppingListItems)
    .set({
      estimatedPriceOre: priceOre,
      priceSource: "Egendefinert",
      priceStore: "Egendefinert",
    })
    .where(eq(shoppingListItems.id, itemId));
  revalidatePath("/handleliste");
  return { success: true };
}

async function generateListName(householdId: number): Promise<string> {
  const weekNum = getISOWeekNumber(new Date());
  const baseName = `Uke ${weekNum}`;

  // Count existing lists with same base name
  const allLists = await db.query.shoppingLists.findMany({
    where: eq(shoppingLists.householdId, householdId),
  });
  const sameNameCount = allLists.filter((l) => l.name.startsWith(baseName)).length;

  return sameNameCount > 0 ? `${baseName} (${sameNameCount + 1})` : baseName;
}

export async function createEmptyList(name?: string) {
  const householdId = await getHouseholdId();
  const today = toISODate(new Date());
  const listName = name || await generateListName(householdId);

  const [list] = await db
    .insert(shoppingLists)
    .values({
      householdId,
      name: listName,
      weekStartDate: today,
      generatedFromMealPlan: false,
    })
    .returning();

  revalidatePath("/handleliste");
  return { success: true, id: list.id };
}

export async function addShoppingTrip(listId: number, date: string, time?: string) {
  const householdId = await getHouseholdId();
  const list = await db.query.shoppingLists.findFirst({
    where: and(eq(shoppingLists.id, listId), eq(shoppingLists.householdId, householdId)),
  });
  if (!list) return { success: false, error: "Liste ikke funnet" };

  // Check for existing trip for same list on same day
  const existing = await db.query.calendarEvents.findFirst({
    where: and(
      eq(calendarEvents.householdId, householdId),
      eq(calendarEvents.date, date),
      eq(calendarEvents.linkedResourceType, "shoppingList"),
      eq(calendarEvents.linkedResourceId, listId)
    ),
  });
  if (existing) {
    return { success: false, error: "Handletur for denne listen er allerede lagt inn denne dagen" };
  }

  await db.insert(calendarEvents).values({
    householdId,
    date,
    startTime: time || null,
    title: `Handletur: ${list.name}`,
    eventType: "avtale",
    linkedResourceType: "shoppingList",
    linkedResourceId: listId,
  });

  revalidatePath("/kalender");
  revalidatePath("/handleliste");
  return { success: true };
}

export async function renameList(listId: number, name: string) {
  const householdId = await getHouseholdId();
  await db
    .update(shoppingLists)
    .set({ name: name.trim() })
    .where(and(eq(shoppingLists.id, listId), eq(shoppingLists.householdId, householdId)));
  revalidatePath("/handleliste");
  return { success: true };
}

export async function addItem(listId: number, name: string, quantity: number, unit: string) {
  await db.insert(shoppingListItems).values({
    shoppingListId: listId,
    name: name.trim(),
    quantity,
    unit,
    checked: false,
    category: guessCategory(name),
  });
  revalidatePath("/handleliste");
  return { success: true };
}

export async function removeItem(itemId: number) {
  await db.delete(shoppingListItems).where(eq(shoppingListItems.id, itemId));
  revalidatePath("/handleliste");
  return { success: true };
}

export async function deleteShoppingList(listId: number) {
  const householdId = await getHouseholdId();
  const list = await db.query.shoppingLists.findFirst({
    where: and(eq(shoppingLists.id, listId), eq(shoppingLists.householdId, householdId)),
  });
  if (!list) return { success: false, error: "Liste ikke funnet" };

  await db.delete(shoppingListItems).where(eq(shoppingListItems.shoppingListId, listId));
  await db.delete(shoppingLists).where(eq(shoppingLists.id, listId));
  revalidatePath("/handleliste");
  return { success: true };
}

export async function shareShoppingList(listId: number): Promise<{ success: true; token: string } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Ikke logget inn" };

  const householdId = await getHouseholdId();
  const list = await db.query.shoppingLists.findFirst({
    where: and(eq(shoppingLists.id, listId), eq(shoppingLists.householdId, householdId)),
  });
  if (!list) return { success: false, error: "Liste ikke funnet" };

  // Generate random token
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  // Expire in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(sharedLinks).values({
    token,
    householdId,
    resourceType: "shoppingList",
    resourceId: listId,
    createdBy: session.user.id,
    expiresAt,
  });

  return { success: true, token };
}

/**
 * Extract just the ingredient name from originalText.
 * Handles formats:
 *   "400 g laks" → "laks"
 *   "ca. 2,5 dl chicken broth" → "chicken broth"
 *   "2 ss limesaft" → "limesaft"
 *   "1 stk avokado" → "avokado"
 *
 * Strategy: strip ALL leading quantity/unit patterns aggressively.
 */
function extractIngredientName(text: string, quantity?: number, unit?: string): string {
  if (!text) return "";

  let cleaned = text
    // Remove "ca. " prefix
    .replace(/^ca\.?\s*/i, "")
    // Remove all leading number patterns (handles "2,5" and "400")
    .replace(/^[\d.,]+\s*/g, "")
    // Remove known units (Norwegian + English)
    .replace(/^(g|kg|dl|l|ml|ss|ts|stk|pk|fedd|klype|bunt|kvast|porsjon|neve|blad|skive|bx|glass|tbsps?|tsps?|cups?|oz|lbs?|servings?|tablespoons?|teaspoons?|pinch|dash|small|medium|large|handful|cans?|pieces?|whole|slices?|sprigs?|cloves?|bunch|packet|package)\s+/i, "")
    // Remove another round of numbers (for "4 tbsps 2 tbsps koriander" → after first strip, might have "2 tbsps koriander")
    .replace(/^[\d.,]+\s*/g, "")
    .replace(/^(g|kg|dl|l|ml|ss|ts|stk|pk|fedd|klype|tbsps?|tsps?|cups?|oz|lbs?|servings?|tablespoons?|teaspoons?|small|medium|large)\s+/i, "")
    .trim();

  // If nothing left, use text as-is
  if (!cleaned) cleaned = text;

  // Remove "to taste", "for garnish" etc.
  cleaned = cleaned
    .replace(/,?\s*(to taste|for garnish|for serving|as needed|optional)\s*$/i, "")
    .trim();

  return cleaned || text;
}

/** Round quantity to sensible precision */
function roundQuantity(qty: number, unit: string): number {
  switch (unit) {
    case "g": return Math.round(qty / 10) * 10; // nearest 10g
    case "kg": return Math.round(qty * 10) / 10; // nearest 0.1kg
    case "dl": return Math.round(qty * 4) / 4; // nearest 0.25dl
    case "l": return Math.round(qty * 10) / 10;
    case "stk": return Math.ceil(qty); // always round up
    case "ss":
    case "ts": return Math.round(qty * 2) / 2; // nearest 0.5
    default: return Math.round(qty * 10) / 10;
  }
}

/** Simple category guesser based on ingredient name */
function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (/laks|torsk|sei|reke|fisk|tunfisk|makrell/.test(n)) return "Fisk og sjømat";
  if (/kylling|kjøttdeig|svin|biff|lam|bacon|pølse|skinke/.test(n)) return "Kjøtt";
  if (/melk|fløte|rømme|ost|yoghurt|smør|kremost/.test(n)) return "Meieri";
  if (/brød|lompe|tortilla|pita/.test(n)) return "Brød og bakervarer";
  if (/ris|pasta|spagetti|nudler|mel|havre|couscous|quinoa/.test(n)) return "Tørrvarer";
  if (/salt|pepper|kanel|karri|paprika|oregano|basilikum|timian|hvitløk/.test(n)) return "Krydder";
  if (/olje|eddik|soyasaus|ketchup|sennep|pesto/.test(n)) return "Krydder";
  if (/eple|banan|appelsin|sitron|bær|mango|ananas/.test(n)) return "Frukt og grønt";
  if (/løk|gulrot|brokkoli|tomat|paprika|spinat|salat|agurk|potet|squash/.test(n)) return "Frukt og grønt";
  return "Annet";
}
