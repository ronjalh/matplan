"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { recipes, recipeIngredients, householdMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { importRecipeFromUrl } from "@/recipe-api/url-import";

export async function importFromUrl(url: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Ikke logget inn" };

  const membership = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, session.user.id),
  });
  if (!membership) return { success: false, error: "Ingen husstand" };

  // Check duplicate
  const existing = await db.query.recipes.findFirst({
    where: and(
      eq(recipes.householdId, membership.householdId),
      eq(recipes.sourceUrl, url)
    ),
  });
  if (existing) return { success: false, error: "Denne oppskriften er allerede importert" };

  // Fetch and parse
  const recipe = await importRecipeFromUrl(url);
  if (!recipe) return { success: false, error: "Kunne ikke finne oppskrift på denne siden. Prøv en annen URL." };

  // Save
  const [saved] = await db
    .insert(recipes)
    .values({
      householdId: membership.householdId,
      name: recipe.name,
      servings: recipe.servings,
      prepTimeMinutes: recipe.prepTimeMinutes,
      instructions: recipe.instructions || null,
      isVegetarian: recipe.isVegetarian,
      isVegan: false,
      isGlutenFree: false,
      isDairyFree: false,
      isNutFree: false,
      isFishMeal: recipe.isFishMeal,
      source: "url-import",
      sourceUrl: url,
    })
    .returning();

  // Save ingredients
  if (recipe.ingredients.length > 0) {
    await db.insert(recipeIngredients).values(
      recipe.ingredients.map((ing) => ({
        recipeId: saved.id,
        quantity: ing.quantity,
        unit: ing.unit,
        originalText: ing.text,
      }))
    );
  }

  revalidatePath("/oppskrifter");
  return { success: true, id: saved.id, recipe };
}
