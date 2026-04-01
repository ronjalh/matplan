import { getRecipe } from "../actions";
import { notFound } from "next/navigation";
import { RecipeDetail } from "./recipe-detail";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipeId = parseInt(id);
  if (isNaN(recipeId)) notFound();

  const recipe = await getRecipe(recipeId);
  if (!recipe) notFound();

  return <RecipeDetail recipe={recipe} />;
}
