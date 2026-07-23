import Link from "next/link";
import { notFound } from "next/navigation";

import { RecipeForm } from "@/app/recipe/new/recipe-form";
import { getRecipeBySlug } from "@/lib/recipe/get";
import { listUnits } from "@/lib/unit/list";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [recipe, units] = await Promise.all([
    getRecipeBySlug(slug),
    listUnits(),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="container form-page">
      <Link href={`/recipe/${recipe.slug}`} className="back-link">
        ← Back to recipe
      </Link>
      <header className="page-header">
        <h1>Edit recipe</h1>
        <p>Update the ingredients or instructions, then save your changes.</p>
      </header>
      <RecipeForm
        units={units}
        initialRecipe={{
          id: recipe.id,
          slug: recipe.slug,
          title: recipe.title,
          ingredients: recipe.ingredients.map((item) => ({
            quantity: item.quantity,
            unitId: item.unitId,
            ingredient: item.ingredient.name,
          })),
          steps: recipe.steps.map((step) => ({
            text: step.markdown,
          })),
        }}
      />
    </main>
  );
}
