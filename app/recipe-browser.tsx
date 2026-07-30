"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { matchesRecipeSearch, parseSearchTerms } from "@/lib/recipe/search";

interface RecipeSummary {
  id: string;
  title: string;
  slug: string;
  photoMimeType: string | null;
  tags: {
    tag: {
      name: string;
      normalizedName: string;
    };
  }[];
  ingredients: {
    ingredient: {
      name: string;
    };
  }[];
}

export function RecipeBrowser({ recipes }: { recipes: RecipeSummary[] }) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const searchTerms = parseSearchTerms(query);
  const isMultiIngredientSearch = searchTerms.length > 1;
  const searchedRecipes = normalizedQuery
    ? recipes.filter((recipe) => matchesRecipeSearch(recipe, query))
    : recipes;
  const filteredRecipes = selectedTag
    ? searchedRecipes.filter((recipe) =>
        recipe.tags.some(({ tag }) => tag.normalizedName === selectedTag),
      )
    : searchedRecipes;
  const availableTags = Array.from(
    new Map(
      recipes.flatMap((recipe) =>
        recipe.tags.map(({ tag }) => [tag.normalizedName, tag] as const),
      ),
    ).values(),
  ).sort((first, second) => first.name.localeCompare(second.name));

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
              placeholder="Search recipes or ingredients..."
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
            <Link href="/recipe/import" className="secondary-action-button">
              Import
            </Link>
            <Link href="/recipe/new" className="button">
              New recipe
            </Link>
          </div>
        )}
        {recipes.length > 0 && (
          <p className="search-help">
            Use commas to require multiple ingredients, like chicken, garlic.
          </p>
        )}
      </section>

      <section className="recipes">
        {recipes.length > 0 && availableTags.length > 0 && (
          <div className="tag-filters" aria-label="Filter recipes by tag">
            <button
              type="button"
              aria-pressed={selectedTag === null}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag.normalizedName}
                type="button"
                aria-pressed={selectedTag === tag.normalizedName}
                onClick={() =>
                  setSelectedTag((current) =>
                    current === tag.normalizedName ? null : tag.normalizedName,
                  )
                }
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

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
            <Link href="/recipe/import" className="empty-state-import-link">
              Import a recipe instead
            </Link>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="empty-state search-empty-state">
            <h2>No matching recipes</h2>
            <p>Try a different recipe, ingredient, or tag.</p>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setQuery("");
                setSelectedTag(null);
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="search-status" aria-live="polite">
              {normalizedQuery
                ? `${filteredRecipes.length} ${
                    filteredRecipes.length === 1 ? "recipe" : "recipes"
                  } found${
                    isMultiIngredientSearch
                      ? " with all listed ingredients"
                      : ""
                  }${selectedTag ? " in this tag" : ""}`
                : selectedTag
                  ? `${filteredRecipes.length} ${
                      filteredRecipes.length === 1 ? "recipe" : "recipes"
                    } in this tag`
                  : `${recipes.length} ${
                      recipes.length === 1 ? "recipe" : "recipes"
                    }`}
            </p>
            <ul className="recipe-list">
              {filteredRecipes.map((recipe) => (
                <li key={recipe.id}>
                  <Link href={`/recipe/${recipe.slug}`} className="recipe-card">
                    {recipe.photoMimeType && (
                      <Image
                        className="recipe-card-photo"
                        src={`/api/recipe/${recipe.id}/photo`}
                        alt=""
                        width={720}
                        height={405}
                        sizes="(max-width: 760px) 100vw, 720px"
                        unoptimized
                      />
                    )}
                    <div className="recipe-card-content">
                      <h2>{recipe.title}</h2>
                      <p>
                        {recipe.ingredients
                          .map(({ ingredient }) => ingredient.name)
                          .join(", ")}
                      </p>
                      {recipe.tags.length > 0 && (
                        <div className="recipe-card-tags">
                          {recipe.tags.map(({ tag }) => (
                            <span className="tag-chip" key={tag.normalizedName}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
