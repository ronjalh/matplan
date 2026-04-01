"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { recipes, recipeIngredients, householdMembers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
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

export async function getRecipe(recipeId: number) {
  const householdId = await getHouseholdId();
  const recipe = await db.query.recipes.findFirst({
    where: and(eq(recipes.id, recipeId), eq(recipes.householdId, householdId)),
  });
  if (!recipe) return null;

  const ingredients = await db.query.recipeIngredients.findMany({
    where: eq(recipeIngredients.recipeId, recipeId),
  });

  return { ...recipe, ingredients };
}

interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
}

export async function createRecipe(formData: FormData) {
  const householdId = await getHouseholdId();

  const name = formData.get("name") as string;

  // Check for duplicate recipe name in this household
  if (name) {
    const existing = await db.query.recipes.findFirst({
      where: and(
        eq(recipes.householdId, householdId),
        eq(recipes.name, name.trim())
      ),
    });
    if (existing) {
      throw new Error(`Du har allerede en oppskrift som heter "${name}"`);
    }
  }
  const description = formData.get("description") as string;
  const servings = parseInt(formData.get("servings") as string) || 4;
  const prepTimeMinutes =
    parseInt(formData.get("prepTimeMinutes") as string) || null;
  const instructions = formData.get("instructions") as string;
  const isVegetarian = formData.get("isVegetarian") === "on";
  const isVegan = formData.get("isVegan") === "on";
  const cuisine = (formData.get("cuisine") as string) || null;
  const ingredientsJson = formData.get("ingredients") as string;

  if (!name) throw new Error("Oppskriften trenger et navn");

  const [recipe] = await db
    .insert(recipes)
    .values({
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
    })
    .returning();

  // Insert ingredients if provided
  if (ingredientsJson) {
    const ingredients: IngredientInput[] = JSON.parse(ingredientsJson);
    if (ingredients.length > 0) {
      await db.insert(recipeIngredients).values(
        ingredients.map((ing) => ({
          recipeId: recipe.id,
          quantity: ing.quantity,
          unit: ing.unit,
          originalText: `${ing.quantity} ${ing.unit} ${ing.name}`,
        }))
      );
    }
  }

  revalidatePath("/oppskrifter");
  return recipe.id;
}

export async function updateRecipe(recipeId: number, formData: FormData) {
  const householdId = await getHouseholdId();

  // Verify ownership
  const existing = await db.query.recipes.findFirst({
    where: and(eq(recipes.id, recipeId), eq(recipes.householdId, householdId)),
  });
  if (!existing) throw new Error("Oppskrift ikke funnet");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const servings = parseInt(formData.get("servings") as string) || 4;
  const prepTimeMinutes =
    parseInt(formData.get("prepTimeMinutes") as string) || null;
  const instructions = formData.get("instructions") as string;
  const isVegetarian = formData.get("isVegetarian") === "on";
  const isVegan = formData.get("isVegan") === "on";
  const cuisine = (formData.get("cuisine") as string) || null;
  const ingredientsJson = formData.get("ingredients") as string;

  if (!name) throw new Error("Oppskriften trenger et navn");

  await db
    .update(recipes)
    .set({
      name,
      description: description || null,
      servings,
      prepTimeMinutes,
      instructions: instructions || null,
      isVegetarian,
      isVegan,
      cuisine,
    })
    .where(eq(recipes.id, recipeId));

  // Replace ingredients
  if (ingredientsJson) {
    await db
      .delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, recipeId));

    const ingredients: IngredientInput[] = JSON.parse(ingredientsJson);
    if (ingredients.length > 0) {
      await db.insert(recipeIngredients).values(
        ingredients.map((ing) => ({
          recipeId,
          quantity: ing.quantity,
          unit: ing.unit,
          originalText: `${ing.quantity} ${ing.unit} ${ing.name}`,
        }))
      );
    }
  }

  revalidatePath("/oppskrifter");
  revalidatePath(`/oppskrifter/${recipeId}`);
}

export async function deleteRecipe(recipeId: number) {
  const householdId = await getHouseholdId();

  const recipe = await db.query.recipes.findFirst({
    where: and(eq(recipes.id, recipeId), eq(recipes.householdId, householdId)),
  });
  if (!recipe) throw new Error("Oppskrift ikke funnet");

  await db
    .delete(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, recipeId));
  await db.delete(recipes).where(eq(recipes.id, recipeId));
  revalidatePath("/oppskrifter");
}
