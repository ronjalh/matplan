"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { recipes, recipeIngredients, householdMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { matpratRecipes } from "@/data/matprat-recipes";

async function getHouseholdId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ikke logget inn");
  const membership = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, session.user.id),
  });
  if (!membership) throw new Error("Ingen husstand funnet");
  return membership.householdId;
}

export async function saveMatpratRecipe(matpratId: number) {
  const householdId = await getHouseholdId();

  const matprat = matpratRecipes.find((r) => r.id === matpratId);
  if (!matprat) return { success: false as const, error: "Oppskrift ikke funnet" };

  // Check if already saved
  const existing = await db.query.recipes.findFirst({
    where: and(eq(recipes.householdId, householdId), eq(recipes.name, matprat.name)),
  });
  if (existing) return { success: false as const, error: "Du har allerede denne oppskriften", existingId: existing.id };

  const [newRecipe] = await db.insert(recipes).values({
    householdId,
    name: matprat.name,
    servings: 4,
    prepTimeMinutes: matprat.prepTimeMinutes,
    instructions: matprat.instructions,
    isFishMeal: matprat.isFishMeal,
    isVegetarian: matprat.isVegetarian,
    isVegan: matprat.isVegan,
    cuisine: matprat.cuisine,
    source: "manual",
  }).returning({ id: recipes.id });

  // Add ingredients
  if (matprat.ingredients.length > 0) {
    await db.insert(recipeIngredients).values(
      matprat.ingredients.map((ing) => ({
        recipeId: newRecipe.id,
        quantity: ing.quantity,
        unit: ing.unit,
        originalText: `${ing.quantity} ${ing.unit} ${ing.name}`,
      }))
    );
  }

  revalidatePath("/oppskrifter");
  return { success: true as const, id: newRecipe.id };
}
