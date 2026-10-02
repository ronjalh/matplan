"use server";

import { auth } from "@/lib/auth/auth-config";
import { db } from "@/db";
import { qrCodes, householdMembers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { validateQrInput } from "@/lib/qr/validate";

async function getHouseholdId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ikke logget inn");
  const membership = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, session.user.id),
  });
  if (!membership) throw new Error("Ingen husstand funnet");
  return membership.householdId;
}

export async function getQrCodes() {
  const householdId = await getHouseholdId();
  return db.query.qrCodes.findMany({
    where: eq(qrCodes.householdId, householdId),
    orderBy: [desc(qrCodes.createdAt)],
  });
}

export async function createQrCode(name: string, url: string) {
  const householdId = await getHouseholdId();

  const validation = validateQrInput(name, url);
  if (!validation.ok) return { success: false, error: validation.error };

  const [qr] = await db.insert(qrCodes).values({
    householdId,
    name: name.trim().slice(0, 200),
    url: url.trim().slice(0, 2000),
  }).returning();

  revalidatePath("/qr-koder");
  return { success: true, id: qr.id };
}

export async function deleteQrCode(id: number) {
  const householdId = await getHouseholdId();
  const qr = await db.query.qrCodes.findFirst({
    where: and(eq(qrCodes.id, id), eq(qrCodes.householdId, householdId)),
  });
  if (!qr) return { success: false, error: "QR-kode ikke funnet" };

  await db.delete(qrCodes).where(eq(qrCodes.id, id));
  revalidatePath("/qr-koder");
  return { success: true };
}
