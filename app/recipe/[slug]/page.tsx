import Link from "next/link";
import { notFound } from "next/navigation";

import { getRecipeBySlug } from "@/lib/recipe/get";

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
        <section className="recipe-panel">
          <h2>Ingredients</h2>
          <ul className="ingredient-list">
            {recipe.ingredients.map((item) => (
              <li key={item.id}>
                <span className="ingredient-amount">
                  {item.quantity ?? ""}
                  {item.quantity !== null && item.unit
                    ? ` ${item.unit.abbreviation}`
                    : ""}
                </span>
                <span>{item.ingredient.name}</span>
              </li>
            ))}
          </ul>
        </section>

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
