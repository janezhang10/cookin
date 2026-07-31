import { eq } from "drizzle-orm";

import {
  recipeIngredients,
  recipes,
  recipeSteps,
  recipeTags,
} from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { findOrCreateIngredient } from "@/lib/ingredient/findOrCreate";
import { findOrCreateTag } from "@/lib/tag/findOrCreate";
import { saveRecipePhoto } from "@/lib/storage/photos";

import { generateSlug } from "./slug";
import type { CreateRecipeInput, RecipePhotoInput } from "./types";

export async function createRecipe(
  input: CreateRecipeInput,
  photo: RecipePhotoInput | null,
) {
  const db = await getDb();
  const slug = await generateSlug(input.title);
  const recipeId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(recipes).values({
    id: recipeId,
    title: input.title.trim(),
    slug,
    isFavorite: false,
    photoKey: null,
    photoMimeType: null,
    createdAt: now,
    updatedAt: now,
  });

  if (photo) {
    const photoKey = await saveRecipePhoto(
      recipeId,
      photo.data,
      photo.mimeType,
    );
    await db
      .update(recipes)
      .set({ photoKey, photoMimeType: photo.mimeType, updatedAt: now })
      .where(eq(recipes.id, recipeId));
  }

  for (const [displayOrder, inputTag] of input.tags.entries()) {
    const tag = await findOrCreateTag(db, inputTag);
    await db.insert(recipeTags).values({
      id: crypto.randomUUID(),
      recipeId,
      tagId: tag.id,
      displayOrder,
      createdAt: now,
    });
  }

  for (const [displayOrder, inputIngredient] of input.ingredients.entries()) {
    const ingredient = await findOrCreateIngredient(
      db,
      inputIngredient.ingredient,
    );
    await db.insert(recipeIngredients).values({
      id: crypto.randomUUID(),
      recipeId,
      ingredientId: ingredient.id,
      quantity: inputIngredient.quantity,
      unitId: inputIngredient.unitId,
      preparation: null,
      optional: false,
      displayOrder,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (input.steps.length > 0) {
    await db.insert(recipeSteps).values(
      input.steps.map((step, index) => ({
        id: crypto.randomUUID(),
        recipeId,
        stepNumber: index + 1,
        markdown: step.text.trim(),
        createdAt: now,
        updatedAt: now,
      })),
    );
  }

  return { id: recipeId, slug, title: input.title.trim() };
}
