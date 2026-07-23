import Link from "next/link";
import { notFound } from "next/navigation";

import { getRecipeBySlug } from "@/lib/recipe/get";

import { RecipeActions } from "./recipe-actions";
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

      <header className="page-header recipe-title-row">
        <h1>{recipe.title}</h1>
        <RecipeActions
          recipeId={recipe.id}
          slug={recipe.slug}
          title={recipe.title}
        />
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
