import { db } from "@/db";
import { sharedLinks, shoppingLists, shoppingListItems } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SharedShoppingList } from "./shared-list";

export default async function SharedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Find valid shared link
  const link = await db.query.sharedLinks.findFirst({
    where: and(
      eq(sharedLinks.token, token),
      eq(sharedLinks.resourceType, "shoppingList"),
      gte(sharedLinks.expiresAt, new Date())
    ),
  });

  if (!link) notFound();

  // Get shopping list
  const list = await db.query.shoppingLists.findFirst({
    where: eq(shoppingLists.id, link.resourceId),
  });

  if (!list) notFound();

  const items = await db.query.shoppingListItems.findMany({
    where: eq(shoppingListItems.shoppingListId, list.id),
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
            Delt handleliste
          </h1>
          <p className="text-sm text-muted-foreground">
            Uke {list.weekStartDate}
          </p>
        </div>
        <SharedShoppingList items={items} token={token} />
      </div>
    </div>
  );
}
