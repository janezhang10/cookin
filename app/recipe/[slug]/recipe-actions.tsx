"use client";

import Link from "next/link";

import { deleteRecipeAction } from "@/lib/recipe/actions";

export function RecipeActions({
  recipeId,
  slug,
  title,
}: {
  recipeId: string;
  slug: string;
  title: string;
}) {
  const deleteAction = deleteRecipeAction.bind(null, recipeId);

  return (
    <div className="recipe-management">
      <Link href={`/recipe/${slug}/edit`} className="secondary-button">
        Edit
      </Link>
      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
            event.preventDefault();
          }
        }}
      >
        <button type="submit" className="danger-button">
          Delete
        </button>
      </form>
    </div>
  );
}
