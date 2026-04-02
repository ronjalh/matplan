import { getBudgetData, getShoppingListsForBudget } from "./actions";
import { BudgetView } from "./budget-view";

export default async function BudsjettPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  const { categories, entries } = await getBudgetData(year, month);
  const shoppingLists = await getShoppingListsForBudget();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-[family-name:var(--font-fraunces)] font-semibold">
        Budsjett
      </h1>
      <BudgetView
        categories={categories}
        entries={entries}
        year={year}
        month={month}
        shoppingLists={shoppingLists}
      />
    </div>
  );
}
