import Link from "next/link";
import { notFound } from "next/navigation";

import { getRecipeBySlug } from "@/lib/recipe/get";

import { ScaledIngredients } from "./scaled-ingredients";

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

      <div className="recipe-content">
        <ScaledIngredients
          ingredients={recipe.ingredients.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            unitAbbreviation: item.unit?.abbreviation ?? null,
            name: item.ingredient.name,
          }))}
        />

        <section className="recipe-panel">
          <h2>Instructions</h2>
          <ol className="instruction-list">
            {recipe.steps.map((step) => (
              <li key={step.id}>{step.markdown}</li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
