import Link from "next/link";
import { notFound } from "next/navigation";

import { getRecipeBySlug } from "@/lib/recipe/get";

import { RecipeContent } from "./recipe-content";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="container recipe-page">
      <Link href="/" className="back-link">
        ← All recipes
      </Link>

      <header className="page-header">
        <h1>{recipe.title}</h1>
      </header>

      <RecipeContent
        ingredients={recipe.ingredients.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitAbbreviation: item.unit?.abbreviation ?? null,
          name: item.ingredient.name,
        }))}
        steps={recipe.steps.map((step) => ({
          id: step.id,
          markdown: step.markdown,
        }))}
      />
    </main>
  );
}
