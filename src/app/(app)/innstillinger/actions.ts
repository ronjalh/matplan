"use server";

import { auth, signOut } from "@/lib/auth/auth-config";
import { db } from "@/db";
import {
  userSettings,
  householdMembers,
  households,
  recipes,
  recipeIngredients,
  mealPlan,
  calendarEvents,
  budgetCategories,
  budgetEntries,
  shoppingLists,
  shoppingListItems,
  sharedLinks,
  ingredientProductLinks,
  users,
  accounts,
  sessions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });
}

export async function updateSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Ikke logget inn" };

  const priceProvider = formData.get("priceProvider") as string;
  const dietaryPreference = formData.get("dietaryPreference") as string;
  const theme = formData.get("theme") as string;

  const validProviders = ["kassalapp", "oda"];
  const validDiets = ["all", "vegetarian", "vegan", "pescetarian"];
  const validThemes = ["system", "light", "dark"];

  await db
    .update(userSettings)
    .set({
      priceProvider: (validProviders.includes(priceProvider) ? priceProvider : "kassalapp") as any,
      dietaryPreference: (validDiets.includes(dietaryPreference) ? dietaryPreference : "all") as any,
      theme: (validThemes.includes(theme) ? theme : "system") as any,
    })
    .where(eq(userSettings.userId, session.user.id));

  revalidatePath("/innstillinger");
  revalidatePath("/handleliste");
  return { success: true };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Ikke logget inn" };

  const userId = session.user.id;

  // Get household
  const membership = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, userId),
  });

  if (membership) {
    const householdId = membership.householdId;

    // Delete all household data in order (respecting foreign keys)
    // Shopping list items → shopping lists
    const lists = await db.query.shoppingLists.findMany({
      where: eq(shoppingLists.householdId, householdId),
    });
    for (const list of lists) {
      await db.delete(shoppingListItems).where(eq(shoppingListItems.shoppingListId, list.id));
    }
    await db.delete(shoppingLists).where(eq(shoppingLists.householdId, householdId));

    // Shared links
    await db.delete(sharedLinks).where(eq(sharedLinks.householdId, householdId));

    // Budget entries → categories
    const cats = await db.query.budgetCategories.findMany({
      where: eq(budgetCategories.householdId, householdId),
    });
    for (const cat of cats) {
      await db.delete(budgetEntries).where(eq(budgetEntries.categoryId, cat.id));
    }
    await db.delete(budgetCategories).where(eq(budgetCategories.householdId, householdId));

    // Calendar events
    await db.delete(calendarEvents).where(eq(calendarEvents.householdId, householdId));

    // Meal plan
    await db.delete(mealPlan).where(eq(mealPlan.householdId, householdId));

    // Recipe ingredients → recipes
    const recs = await db.query.recipes.findMany({
      where: eq(recipes.householdId, householdId),
    });
    for (const rec of recs) {
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, rec.id));
    }
    await db.delete(recipes).where(eq(recipes.householdId, householdId));

    // Household members → household
    await db.delete(householdMembers).where(eq(householdMembers.householdId, householdId));
    await db.delete(households).where(eq(households.id, householdId));
  }

  // Delete user-level data
  await db.delete(ingredientProductLinks).where(eq(ingredientProductLinks.userId, userId));
  await db.delete(userSettings).where(eq(userSettings.userId, userId));
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(accounts).where(eq(accounts.userId, userId));
  await db.delete(users).where(eq(users.id, userId));

  // Sign out
  await signOut({ redirectTo: "/login" });
  return { success: true };
}
