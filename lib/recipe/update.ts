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
import {
  deleteRecipePhoto,
  recipePhotoKey,
  saveRecipePhoto,
} from "@/lib/storage/photos";

import { generateSlug } from "./slug";
import type { CreateRecipeInput, RecipePhotoUpdate } from "./types";

export async function updateRecipe(
  recipeId: string,
  input: CreateRecipeInput,
  photo: RecipePhotoUpdate,
) {
  const db = await getDb();
  const slug = await generateSlug(input.title, recipeId);
  const [existingRecipe] = await db
    .select({ photoKey: recipes.photoKey })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!existingRecipe) {
    throw new Error("Recipe not found.");
  }

  const now = new Date().toISOString();
  await db.delete(recipeTags).where(eq(recipeTags.recipeId, recipeId));
  await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipeId));
  await db
    .delete(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, recipeId));

  await db
    .update(recipes)
    .set({
      title: input.title.trim(),
      slug,
      updatedAt: now,
      ...(photo === undefined
        ? {}
        : photo === null
          ? { photoKey: null, photoMimeType: null }
          : {
              photoKey: recipePhotoKey(recipeId),
              photoMimeType: photo.mimeType,
            }),
    })
    .where(eq(recipes.id, recipeId));

  if (photo === null && existingRecipe.photoKey) {
    await deleteRecipePhoto(existingRecipe.photoKey);
  } else if (photo) {
    await saveRecipePhoto(recipeId, photo.data, photo.mimeType);
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
