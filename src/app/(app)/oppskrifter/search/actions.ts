"use server";

import { searchRecipes, getRecipeDetails } from "@/recipe-api/spoonacular";
import { translateIngredient } from "@/data/ingredient-translations";
import { convertToNorwegian, formatMeasurement } from "@/lib/unit-conversion/convert";
import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { recipes, recipeIngredients, householdMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function searchSpoonacular(params: {
  query: string;
  diet?: string;
  cuisine?: string;
  maxReadyTime?: number;
}) {
  const result = await searchRecipes({
    query: params.query,
    diet: params.diet as any,
    cuisine: params.cuisine,
    maxReadyTime: params.maxReadyTime,
    number: 12,
  });
  return result;
}

export async function importSpoonacularRecipe(spoonacularId: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Ikke logget inn" };

  const membership = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, session.user.id),
  });
  if (!membership) return { success: false, error: "Ingen husstand funnet" };

  // Check if already imported
  const existing = await db.query.recipes.findFirst({
    where: and(
      eq(recipes.householdId, membership.householdId),
      eq(recipes.sourceId, String(spoonacularId))
    ),
  });
  if (existing) {
    return { success: false, error: "Denne oppskriften er allerede importert" };
  }

  // Fetch full details from Spoonacular
  const detail = await getRecipeDetails(spoonacularId);

  // Build instructions from steps
  const instructions = detail.analyzedInstructions?.[0]?.steps
    ?.map((s) => `${s.number}. ${s.step}`)
    .join("\n") ?? "";

  // Detect fish from ingredients
  const fishKeywords = /\b(salmon|cod|tuna|shrimp|prawn|fish|mackerel|trout|herring|haddock|pollock|crab|lobster|mussel|clam|anchov|sardine|tilapia|halibut|swordfish|sea bass|mahi)\b/i;
  const isFishMeal = detail.extendedIngredients?.some(
    (ing) => fishKeywords.test(ing.name)
  ) ?? false;

  // Insert recipe
  const [recipe] = await db
    .insert(recipes)
    .values({
      householdId: membership.householdId,
      name: detail.title,
      description: null,
      servings: detail.servings,
      prepTimeMinutes: detail.readyInMinutes,
      instructions: instructions || null,
      isVegetarian: detail.vegetarian,
      isVegan: detail.vegan,
      isGlutenFree: detail.glutenFree,
      isDairyFree: detail.dairyFree,
      isNutFree: false,
      isFishMeal,
      cuisine: detail.cuisines?.[0] ?? null,
      source: "spoonacular",
      sourceUrl: detail.sourceUrl,
      sourceId: String(detail.id),
    })
    .returning();

  // Insert ingredients with Norwegian conversion
  if (detail.extendedIngredients?.length > 0) {
    await db.insert(recipeIngredients).values(
      detail.extendedIngredients.map((ing) => {
        // Use metric amounts when available
        const metric = ing.measures?.metric;
        const amount = metric?.amount ?? ing.amount;
        const unit = metric?.unitShort ?? ing.unit;

        // Convert to Norwegian units
        const converted = convertToNorwegian(amount, unit);
        const { norwegian } = translateIngredient(ing.name);
        const display = formatMeasurement(converted.quantity, converted.unit, converted.approximate);

        return {
          recipeId: recipe.id,
          quantity: converted.quantity,
          unit: converted.unit,
          originalText: `${display} ${norwegian}`,
        };
      })
    );
  }

  revalidatePath("/oppskrifter");
  return { success: true, id: recipe.id };
}
