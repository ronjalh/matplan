import { db } from "@/db";
import { sharedLinks, shoppingLists, shoppingListItems } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SharedShoppingList } from "./shared-list";
import { ShoppingCart } from "lucide-react";

export default async function SharedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Check if link ever existed (to distinguish revoked from invalid)
  const anyLink = await db.query.sharedLinks.findFirst({
    where: eq(sharedLinks.token, token),
  });

  // Find valid (non-expired) shared link
  const link = anyLink && anyLink.expiresAt >= new Date() ? anyLink : null;

  if (!link) {
    // Revoked or expired
    if (anyLink) {
      // Link existed but was revoked or expired
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
            <h1 className="text-xl font-semibold">Lenken er ikke lenger gyldig</h1>
            <p className="text-muted-foreground text-sm">
              Personen som delte denne handlelisten har fjernet tilgangen, eller lenken har utl&oslash;pt.
            </p>
          </div>
        </div>
      );
    }
    notFound();
  }

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
