"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { budgetCategories, budgetEntries, householdMembers, shoppingLists, shoppingListItems } from "@/db/schema";
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

  // Verify category belongs to household before deleting entries
  const cat = await db.query.budgetCategories.findFirst({
    where: and(eq(budgetCategories.id, categoryId), eq(budgetCategories.householdId, householdId)),
  });
  if (!cat) return { success: false, error: "Kategori ikke funnet" };

  await db.delete(budgetEntries).where(
    and(eq(budgetEntries.categoryId, categoryId), eq(budgetEntries.householdId, householdId))
  );
  await db.delete(budgetCategories).where(eq(budgetCategories.id, categoryId));

  revalidatePath("/budsjett");
  return { success: true };
}

export async function addExpense(categoryId: number, date: string, description: string, amountKr: number) {
  const householdId = await getHouseholdId();

  // Verify category belongs to household
  const cat = await db.query.budgetCategories.findFirst({
    where: and(eq(budgetCategories.id, categoryId), eq(budgetCategories.householdId, householdId)),
  });
  if (!cat) return { success: false, error: "Kategori ikke funnet" };

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

export async function updateExpense(entryId: number, description: string, amountKr: number, date: string) {
  const householdId = await getHouseholdId();

  await db
    .update(budgetEntries)
    .set({
      description: description.trim(),
      amountOre: Math.round(amountKr * 100),
      date,
    })
    .where(and(eq(budgetEntries.id, entryId), eq(budgetEntries.householdId, householdId)));

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

/**
 * SIFO reference budgets (2025 approximate, in øre/month).
 * Source: OsloMet/SIFO Referansebudsjettet
 */
const SIFO_BUDGETS: Record<string, { name: string; limit: number; color: string }[]> = {
  single: [
    { name: "Mat og drikke", limit: 320000, color: "#7C9A7E" },
    { name: "Bolig og energi", limit: 550000, color: "#4A90A4" },
    { name: "Transport", limit: 100000, color: "#C27B5A" },
    { name: "Klær og sko", limit: 80000, color: "#E06090" },
    { name: "Helse og hygiene", limit: 60000, color: "#9B7ED8" },
    { name: "Fritid og kultur", limit: 80000, color: "#E8A838" },
    { name: "Kommunikasjon", limit: 40000, color: "#4A90A4" },
    { name: "Sparing", limit: 150000, color: "#4ABFA8" },
  ],
  couple: [
    { name: "Mat og drikke", limit: 560000, color: "#7C9A7E" },
    { name: "Bolig og energi", limit: 700000, color: "#4A90A4" },
    { name: "Transport", limit: 150000, color: "#C27B5A" },
    { name: "Klær og sko", limit: 120000, color: "#E06090" },
    { name: "Helse og hygiene", limit: 80000, color: "#9B7ED8" },
    { name: "Fritid og kultur", limit: 120000, color: "#E8A838" },
    { name: "Kommunikasjon", limit: 60000, color: "#4A90A4" },
    { name: "Sparing", limit: 250000, color: "#4ABFA8" },
  ],
  family: [
    { name: "Mat og drikke", limit: 840000, color: "#7C9A7E" },
    { name: "Bolig og energi", limit: 900000, color: "#4A90A4" },
    { name: "Transport", limit: 200000, color: "#C27B5A" },
    { name: "Klær og sko", limit: 150000, color: "#E06090" },
    { name: "Helse og hygiene", limit: 100000, color: "#9B7ED8" },
    { name: "Fritid og kultur", limit: 150000, color: "#E8A838" },
    { name: "Barnehage/SFO", limit: 300000, color: "#C27B5A" },
    { name: "Kommunikasjon", limit: 80000, color: "#4A90A4" },
    { name: "Sparing", limit: 300000, color: "#4ABFA8" },
  ],
};

export async function importShoppingListAsExpense(shoppingListId: number, categoryId: number) {
  const householdId = await getHouseholdId();

  // Verify category belongs to household
  const cat = await db.query.budgetCategories.findFirst({
    where: and(eq(budgetCategories.id, categoryId), eq(budgetCategories.householdId, householdId)),
  });
  if (!cat) return { success: false, error: "Kategori ikke funnet" };

  // Get shopping list with items
  const list = await db.query.shoppingLists.findFirst({
    where: and(eq(shoppingLists.id, shoppingListId), eq(shoppingLists.householdId, householdId)),
  });
  if (!list) return { success: false, error: "Handleliste ikke funnet" };

  const items = await db.query.shoppingListItems.findMany({
    where: eq(shoppingListItems.shoppingListId, shoppingListId),
  });

  // Sum all prices
  const totalOre = items
    .filter((i) => i.estimatedPriceOre)
    .reduce((sum, i) => sum + i.estimatedPriceOre!, 0);

  if (totalOre === 0) return { success: false, error: "Handlelisten har ingen priser" };

  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  await db.insert(budgetEntries).values({
    householdId,
    categoryId,
    date,
    description: `Handleliste: ${list.name}`,
    amountOre: totalOre,
  });

  revalidatePath("/budsjett");
  return { success: true, amountOre: totalOre };
}

export async function getShoppingListsForBudget() {
  const householdId = await getHouseholdId();

  return db.query.shoppingLists.findMany({
    where: eq(shoppingLists.householdId, householdId),
    orderBy: [desc(shoppingLists.createdAt)],
    columns: { id: true, name: true, weekStartDate: true },
  });
}

export async function seedDefaultCategories(householdType: string = "single") {
  const householdId = await getHouseholdId();

  const existing = await db.query.budgetCategories.findMany({
    where: eq(budgetCategories.householdId, householdId),
  });
  if (existing.length > 0) return { success: false, error: "Kategorier finnes allerede" };

  const defaults = SIFO_BUDGETS[householdType] ?? SIFO_BUDGETS.single;

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
