"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { budgetCategories, budgetEntries, householdMembers } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
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

export async function getBudgetData(year: number, month: number) {
  const householdId = await getHouseholdId();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const categories = await db.query.budgetCategories.findMany({
    where: eq(budgetCategories.householdId, householdId),
    orderBy: [budgetCategories.sortOrder],
  });

  const entries = await db.query.budgetEntries.findMany({
    where: and(
      eq(budgetEntries.householdId, householdId),
      gte(budgetEntries.date, startDate),
      lte(budgetEntries.date, endDate)
    ),
    orderBy: [desc(budgetEntries.date)],
  });

  return { categories, entries };
}

export async function createCategory(name: string, monthlyLimitKr: number, color: string) {
  const householdId = await getHouseholdId();

  const existing = await db.query.budgetCategories.findMany({
    where: eq(budgetCategories.householdId, householdId),
  });

  await db.insert(budgetCategories).values({
    householdId,
    name: name.trim(),
    monthlyLimitOre: Math.round(monthlyLimitKr * 100),
    color: color || "#7C9A7E",
    sortOrder: existing.length,
  });

  revalidatePath("/budsjett");
  return { success: true };
}

export async function updateCategory(categoryId: number, name: string, monthlyLimitKr: number, color: string) {
  const householdId = await getHouseholdId();

  await db
    .update(budgetCategories)
    .set({
      name: name.trim(),
      monthlyLimitOre: Math.round(monthlyLimitKr * 100),
      color,
    })
    .where(and(eq(budgetCategories.id, categoryId), eq(budgetCategories.householdId, householdId)));

  revalidatePath("/budsjett");
  return { success: true };
}

export async function deleteCategory(categoryId: number) {
  const householdId = await getHouseholdId();

  await db.delete(budgetEntries).where(eq(budgetEntries.categoryId, categoryId));
  await db.delete(budgetCategories).where(
    and(eq(budgetCategories.id, categoryId), eq(budgetCategories.householdId, householdId))
  );

  revalidatePath("/budsjett");
  return { success: true };
}

export async function addExpense(categoryId: number, date: string, description: string, amountKr: number) {
  const householdId = await getHouseholdId();

  await db.insert(budgetEntries).values({
    householdId,
    categoryId,
    date,
    description: description.trim(),
    amountOre: Math.round(amountKr * 100),
  });

  revalidatePath("/budsjett");
  return { success: true };
}

export async function deleteExpense(entryId: number) {
  const householdId = await getHouseholdId();

  await db.delete(budgetEntries).where(
    and(eq(budgetEntries.id, entryId), eq(budgetEntries.householdId, householdId))
  );

  revalidatePath("/budsjett");
  return { success: true };
}

export async function seedDefaultCategories() {
  const householdId = await getHouseholdId();

  const existing = await db.query.budgetCategories.findMany({
    where: eq(budgetCategories.householdId, householdId),
  });
  if (existing.length > 0) return { success: false, error: "Kategorier finnes allerede" };

  const defaults = [
    { name: "Mat og drikke", limit: 400000, color: "#7C9A7E" },
    { name: "Bolig og energi", limit: 800000, color: "#4A90A4" },
    { name: "Transport", limit: 200000, color: "#C27B5A" },
    { name: "Klær og sko", limit: 100000, color: "#E06090" },
    { name: "Helse og hygiene", limit: 80000, color: "#9B7ED8" },
    { name: "Fritid og kultur", limit: 100000, color: "#E8A838" },
    { name: "Sparing", limit: 200000, color: "#6ABF69" },
  ];

  await db.insert(budgetCategories).values(
    defaults.map((d, i) => ({
      householdId,
      name: d.name,
      monthlyLimitOre: d.limit,
      color: d.color,
      sortOrder: i,
    }))
  );

  revalidatePath("/budsjett");
  return { success: true };
}
