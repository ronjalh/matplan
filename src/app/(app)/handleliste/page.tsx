import { getAllShoppingLists, getShoppingList } from "./actions";
import { ShoppingListView } from "./shopping-list-view";

export default async function HandlelistePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const listId = params.id ? parseInt(params.id) : undefined;

  const allLists = await getAllShoppingLists();
  const currentList = allLists.length > 0
    ? await getShoppingList(listId ?? allLists[0]?.id)
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
        Handleliste
      </h1>
      <ShoppingListView
        list={currentList}
        allLists={allLists.map((l) => ({ id: l.id, name: l.name, weekStartDate: l.weekStartDate, createdAt: l.createdAt.toISOString() }))}
        activeListId={currentList?.id}
      />
    </div>
  );
}
