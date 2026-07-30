"use client";

import { useFormStatus } from "react-dom";

import { toggleRecipeFavoriteAction } from "@/lib/recipe/actions";

function FavoriteSubmitButton({
  isFavorite,
  compact,
}: {
  isFavorite: boolean;
  compact: boolean;
}) {
  const { pending } = useFormStatus();
  const label = isFavorite ? "Remove from favorites" : "Add to favorites";

  return (
    <button
      type="submit"
      className={`favorite-button${compact ? " favorite-button-compact" : ""}`}
      aria-label={label}
      title={label}
      aria-pressed={isFavorite}
      disabled={pending}
    >
      <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
      {!compact && (isFavorite ? "Favorited" : "Favorite")}
    </button>
  );
}

export function FavoriteButton({
  recipeId,
  slug,
  isFavorite,
  compact = false,
}: {
  recipeId: string;
  slug: string;
  isFavorite: boolean;
  compact?: boolean;
}) {
  const action = toggleRecipeFavoriteAction.bind(null, recipeId, slug);

  return (
    <form action={action} className="favorite-form">
      <FavoriteSubmitButton isFavorite={isFavorite} compact={compact} />
    </form>
  );
}
