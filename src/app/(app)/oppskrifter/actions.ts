"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { recipes, recipeIngredients, householdMembers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

export async function getRecipes() {
  const householdId = await getHouseholdId();
  return db.query.recipes.findMany({
    where: eq(recipes.householdId, householdId),
    orderBy: [desc(recipes.createdAt)],
  });
}

export async function createRecipe(formData: FormData) {
  const householdId = await getHouseholdId();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const servings = parseInt(formData.get("servings") as string) || 4;
  const prepTimeMinutes = parseInt(formData.get("prepTimeMinutes") as string) || null;
  const instructions = formData.get("instructions") as string;
  const isVegetarian = formData.get("isVegetarian") === "on";
  const isVegan = formData.get("isVegan") === "on";
  const cuisine = formData.get("cuisine") as string || null;

  if (!name) throw new Error("Oppskriften trenger et navn");

  await db.insert(recipes).values({
    householdId,
    name,
    description: description || null,
    servings,
    prepTimeMinutes,
    instructions: instructions || null,
    isVegetarian,
    isVegan,
    isFishMeal: false,
    cuisine,
    source: "manual",
  });

  revalidatePath("/oppskrifter");
}

export async function deleteRecipe(recipeId: number) {
  const householdId = await getHouseholdId();

  // Verify recipe belongs to this household
  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.id, recipeId),
  });
  if (!recipe || recipe.householdId !== householdId) {
    throw new Error("Oppskrift ikke funnet");
  }

  await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));
  await db.delete(recipes).where(eq(recipes.id, recipeId));
  revalidatePath("/oppskrifter");
}
