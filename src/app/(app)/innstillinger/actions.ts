"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { userSettings, householdMembers } from "@/db/schema";
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

  const priceProvider = formData.get("priceProvider") as "kassalapp" | "oda";
  const dietaryPreference = formData.get("dietaryPreference") as string;
  const theme = formData.get("theme") as string;

  await db
    .update(userSettings)
    .set({
      priceProvider: priceProvider ?? "kassalapp",
      dietaryPreference: (dietaryPreference as any) ?? "all",
      theme: (theme as any) ?? "system",
    })
    .where(eq(userSettings.userId, session.user.id));

  revalidatePath("/innstillinger");
  revalidatePath("/handleliste");
  return { success: true };
}
