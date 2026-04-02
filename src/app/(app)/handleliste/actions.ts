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
  householdMembers,
} from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getMonday, getWeekDays, toISODate } from "@/lib/date-utils";
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
    const name = extractIngredientName(ing.originalText ?? `${ing.quantity} ${ing.unit}`);
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

  // Create shopping list
  const [list] = await db
    .insert(shoppingLists)
    .values({
      householdId,
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
          priceSource: price ? `${price.productName} — ${price.store}` : null,
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
    })
    .where(eq(shoppingListItems.id, itemId));
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

/** Extract ingredient name from "400 g laks" → "laks" */
function extractIngredientName(text: string): string {
  // Remove leading quantity + unit pattern
  const cleaned = text.replace(/^[\d.,]+\s*(g|kg|dl|l|ml|ss|ts|stk|pk|fedd|klype|ca\.?\s*[\d.,]*\s*(g|kg|dl|l|ml))\s*/i, "");
  return cleaned.trim() || text;
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
