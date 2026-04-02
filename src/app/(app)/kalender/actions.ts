"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import {
  mealPlan,
  calendarEvents,
  recipes,
  householdMembers,
} from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getHouseholdId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ikke logget inn");
  const membership = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, session.user.id),
  });
  if (!membership) throw new Error("Ingen husstand funnet");
  return membership.householdId;
}

export async function getWeekData(startDate: string, endDate: string) {
  const householdId = await getHouseholdId();

  const meals = await db
    .select({
      id: mealPlan.id,
      date: mealPlan.date,
      mealType: mealPlan.mealType,
      recipeId: mealPlan.recipeId,
      servingsOverride: mealPlan.servingsOverride,
      freeText: mealPlan.freeText,
      recipeName: recipes.name,
      recipeServings: recipes.servings,
      recipePrepTime: recipes.prepTimeMinutes,
      recipeIsVegetarian: recipes.isVegetarian,
      recipeIsFishMeal: recipes.isFishMeal,
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

  const events = await db.query.calendarEvents.findMany({
    where: and(
      eq(calendarEvents.householdId, householdId),
      gte(calendarEvents.date, startDate),
      lte(calendarEvents.date, endDate)
    ),
  });

  // Get all household recipes for the meal picker
  const allRecipes = await db.query.recipes.findMany({
    where: eq(recipes.householdId, householdId),
    columns: { id: true, name: true, servings: true, prepTimeMinutes: true, isVegetarian: true, isFishMeal: true },
  });

  return { meals, events, allRecipes };
}

type MealType = "frokost" | "lunsj" | "middag" | "kveldsmat";

export async function addMeal(
  date: string,
  mealType: MealType,
  recipeId: number | null,
  freeText: string | null
) {
  const householdId = await getHouseholdId();

  // Check if slot already has a meal
  const existing = await db.query.mealPlan.findFirst({
    where: and(
      eq(mealPlan.householdId, householdId),
      eq(mealPlan.date, date),
      eq(mealPlan.mealType, mealType)
    ),
  });

  if (existing) {
    // Update existing
    await db
      .update(mealPlan)
      .set({ recipeId, freeText })
      .where(eq(mealPlan.id, existing.id));
  } else {
    await db.insert(mealPlan).values({
      householdId,
      date,
      mealType,
      recipeId,
      freeText,
    });
  }

  revalidatePath("/kalender");
  return { success: true };
}

export async function removeMeal(mealId: number) {
  const householdId = await getHouseholdId();
  const meal = await db.query.mealPlan.findFirst({
    where: and(eq(mealPlan.id, mealId), eq(mealPlan.householdId, householdId)),
  });
  if (!meal) return { success: false, error: "Måltid ikke funnet" };

  await db.delete(mealPlan).where(eq(mealPlan.id, mealId));
  revalidatePath("/kalender");
  return { success: true };
}

export async function addEvent(
  date: string,
  title: string,
  eventType: string,
  startTime?: string,
  endTime?: string,
  description?: string
) {
  const householdId = await getHouseholdId();

  await db.insert(calendarEvents).values({
    householdId,
    date,
    title,
    eventType: eventType as any,
    startTime: startTime || null,
    endTime: endTime || null,
    description: description || null,
  });

  revalidatePath("/kalender");
  return { success: true };
}

export async function updateEvent(
  eventId: number,
  data: { title?: string; startTime?: string; endTime?: string; eventType?: string }
) {
  const householdId = await getHouseholdId();
  const event = await db.query.calendarEvents.findFirst({
    where: and(eq(calendarEvents.id, eventId), eq(calendarEvents.householdId, householdId)),
  });
  if (!event) return { success: false, error: "Hendelse ikke funnet" };

  await db
    .update(calendarEvents)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.startTime !== undefined && { startTime: data.startTime || null }),
      ...(data.endTime !== undefined && { endTime: data.endTime || null }),
      ...(data.eventType !== undefined && { eventType: data.eventType as any }),
    })
    .where(eq(calendarEvents.id, eventId));

  revalidatePath("/kalender");
  return { success: true };
}

export async function removeEvent(eventId: number) {
  const householdId = await getHouseholdId();
  const event = await db.query.calendarEvents.findFirst({
    where: and(eq(calendarEvents.id, eventId), eq(calendarEvents.householdId, householdId)),
  });
  if (!event) return { success: false, error: "Hendelse ikke funnet" };

  await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));
  revalidatePath("/kalender");
  return { success: true };
}
