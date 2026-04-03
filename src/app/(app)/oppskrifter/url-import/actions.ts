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

  // Validate URL format and allowlist
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return { success: false, error: "Kun HTTPS-URLer er støttet." };
    const hostname = parsed.hostname.toLowerCase();
    const allowed = ["matprat.no", "www.matprat.no"];
    if (!allowed.includes(hostname)) {
      return { success: false, error: "For øyeblikket støtter vi kun import fra matprat.no. Flere sider kommer snart!" };
    }
  } catch {
    return { success: false, error: "Ugyldig URL." };
  }

  // Fetch and parse
  const recipe = await importRecipeFromUrl(url);
  if (!recipe) return { success: false, error: "Kunne ikke finne oppskrift på denne siden. Prøv en annen URL fra matprat.no." };

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

  // Save ingredients — merge duplicates (same name + unit)
  if (recipe.ingredients.length > 0) {
    const merged = new Map<string, { quantity: number; unit: string; text: string }>();
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}|${ing.unit}`;
      const existing = merged.get(key);
      if (existing) {
        existing.quantity += ing.quantity;
        existing.text = `${existing.quantity} ${ing.unit} ${ing.name}`;
      } else {
        merged.set(key, { quantity: ing.quantity, unit: ing.unit, text: ing.text });
      }
    }

    await db.insert(recipeIngredients).values(
      Array.from(merged.values()).map((ing) => ({
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
