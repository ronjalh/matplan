import { getShoppingList } from "./actions";
import { ShoppingListView } from "./shopping-list-view";

export default async function HandlelistePage() {
  const list = await getShoppingList();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
        Handleliste
      </h1>
      <ShoppingListView list={list} />
    </div>
  );
}
