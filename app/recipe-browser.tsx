"use client";

import Link from "next/link";
import { useState } from "react";

interface RecipeSummary {
  id: string;
  title: string;
  slug: string;
  ingredients: {
    ingredient: {
      name: string;
    };
  }[];
}

export function RecipeBrowser({ recipes }: { recipes: RecipeSummary[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRecipes = normalizedQuery
    ? recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(normalizedQuery) ||
          recipe.ingredients.some(({ ingredient }) =>
            ingredient.name.toLowerCase().includes(normalizedQuery),
          ),
      )
    : recipes;

  return (
    <>
      <section className="hero">
        <h1>Cookin</h1>
        <p>Your personal recipe collection.</p>

        {recipes.length > 0 && (
          <div className="search-row">
            <label className="sr-only" htmlFor="recipe-search">
              Search recipes
            </label>
            <input
              id="recipe-search"
              className="search"
              type="search"
              value={query}
              placeholder="Search by recipe or ingredient..."
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
            <Link href="/recipe/new" className="button">
              New recipe
            </Link>
          </div>
        )}
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
              New recipe
            </Link>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="empty-state search-empty-state">
            <h2>No matching recipes</h2>
            <p>Try a different recipe or ingredient.</p>
            <button
              type="button"
              className="text-button"
              onClick={() => setQuery("")}
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <p className="search-status" aria-live="polite">
              {normalizedQuery
                ? `${filteredRecipes.length} ${
                    filteredRecipes.length === 1 ? "recipe" : "recipes"
                  } found`
                : `${recipes.length} ${
                    recipes.length === 1 ? "recipe" : "recipes"
                  }`}
            </p>
            <ul className="recipe-list">
              {filteredRecipes.map((recipe) => (
                <li key={recipe.id}>
                  <Link href={`/recipe/${recipe.slug}`} className="recipe-card">
                    <h2>{recipe.title}</h2>
                    <p>
                      {recipe.ingredients
                        .map(({ ingredient }) => ingredient.name)
                        .join(", ")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
