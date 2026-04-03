import { matpratRecipes } from "@/data/matprat-recipes";
import { notFound } from "next/navigation";
import { MatpratRecipeDetail } from "./matprat-recipe-detail";

export default async function MatpratRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matpratId = parseInt(id);

  const recipe = matpratRecipes.find((r) => r.id === matpratId);
  if (!recipe) notFound();

  return <MatpratRecipeDetail recipe={recipe} />;
}
