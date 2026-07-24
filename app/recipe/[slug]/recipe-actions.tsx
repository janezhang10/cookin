"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { ConfirmationDialog } from "@/app/confirmation-dialog";
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
  const formRef = useRef<HTMLFormElement>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="recipe-management">
      <Link href={`/recipe/${slug}/edit`} className="secondary-button">
        Edit
      </Link>
      <form ref={formRef} action={deleteAction}>
        <button
          type="button"
          className="danger-button"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Delete
        </button>
      </form>

      <ConfirmationDialog
        open={showDeleteConfirmation}
        title={`Delete “${title}”?`}
        description="This recipe and all of its ingredients and instructions will be permanently removed."
        confirmLabel="Delete recipe"
        cancelLabel="Keep recipe"
        tone="danger"
        busy={deleting}
        onCancel={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {
          setDeleting(true);
          formRef.current?.requestSubmit();
        }}
      />
    </div>
  );
}
