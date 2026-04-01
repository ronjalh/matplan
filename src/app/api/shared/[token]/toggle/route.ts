import { db } from "@/db";
import { sharedLinks, shoppingListItems } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { itemId } = await request.json();

  // Verify token is valid
  const link = await db.query.sharedLinks.findFirst({
    where: and(
      eq(sharedLinks.token, token),
      gte(sharedLinks.expiresAt, new Date())
    ),
  });

  if (!link) {
    return NextResponse.json({ error: "Ugyldig lenke" }, { status: 404 });
  }

  // Get current item state
  const item = await db.query.shoppingListItems.findFirst({
    where: eq(shoppingListItems.id, itemId),
  });

  if (!item) {
    return NextResponse.json({ error: "Vare ikke funnet" }, { status: 404 });
  }

  // Toggle
  await db
    .update(shoppingListItems)
    .set({ checked: !item.checked })
    .where(eq(shoppingListItems.id, itemId));

  return NextResponse.json({ success: true });
}
