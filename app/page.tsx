import Link from "next/link";

import { listRecipes } from "@/lib/recipe/list";

export default async function HomePage() {
  const recipes = await listRecipes();

  return (
    <main className="container">
      <section className="hero">
        <h1>Cookin</h1>
        <p>Your personal recipe collection.</p>

        <input
          className="search"
          type="text"
          placeholder="Search recipes..."
          disabled
        />
      </section>

      <section className="recipes">
        {recipes.length === 0 ? (
          <div className="empty-state">
            <h2>No recipes yet</h2>

            <p>
              Start building your personal cookbook by creating your first
              recipe.
            </p>

            <Link href="/recipe/new" className="button">
              New Recipe
            </Link>
          </div>
        ) : (
          <ul className="recipe-list">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <Link href={`/recipe/${recipe.slug}`} className="recipe-card">
                  <h2>{recipe.title}</h2>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
