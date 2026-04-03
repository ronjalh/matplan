"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { userSettings, budgetCategories, householdMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const diet = formData.get("diet") as string;
  const priceProvider = formData.get("priceProvider") as string;
  const budgetType = formData.get("budgetType") as string;

  // Update settings
  await db
    .update(userSettings)
    .set({
      dietaryPreference: (diet as any) ?? "all",
      priceProvider: (priceProvider as any) ?? "kassalapp",
      onboardingComplete: true,
    })
    .where(eq(userSettings.userId, session.user.id));

  // Seed budget if requested
  if (budgetType && budgetType !== "skip") {
    const membership = await db.query.householdMembers.findFirst({
      where: eq(householdMembers.userId, session.user.id),
    });

    if (membership) {
      const existing = await db.query.budgetCategories.findMany({
        where: eq(budgetCategories.householdId, membership.householdId),
      });

      if (existing.length === 0) {
        const { seedDefaultCategories } = await import("@/app/(app)/budsjett/actions");
        await seedDefaultCategories(budgetType);
      }
    }
  }

  redirect("/");
}

export async function skipOnboarding() {
  const session = await auth();
  if (!session?.user?.id) return;

  await db
    .update(userSettings)
    .set({ onboardingComplete: true })
    .where(eq(userSettings.userId, session.user.id));

  redirect("/");
}

export async function quickPlanOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const diet = formData.get("diet") as string;
  const servings = formData.get("servings") as string;

  const validDiets = ["all", "vegetarian", "vegan", "pescetarian"];

  await db
    .update(userSettings)
    .set({
      dietaryPreference: (validDiets.includes(diet) ? diet : "all") as any,
      onboardingComplete: true,
    })
    .where(eq(userSettings.userId, session.user.id));

  redirect(`/kalender?autoplan=true&servings=${servings || "4"}`);
}
