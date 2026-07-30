"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createRecipe } from "@/lib/recipe/create";
import { deleteRecipe } from "@/lib/recipe/delete";
import { toggleRecipeFavorite } from "@/lib/recipe/toggleFavorite";
import { updateRecipe } from "@/lib/recipe/update";
import { createRecipeSchema } from "@/lib/validation/recipe";
import type { RecipePhotoUpdate } from "@/lib/recipe/types";

export interface RecipeActionState {
  errors: string[];
}

function parseRows(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string") {
    throw new Error(`Missing ${field}.`);
  }

  const parsed: unknown = JSON.parse(value);

  if (!Array.isArray(parsed)) {
    throw new Error(`Invalid ${field}.`);
  }

  return parsed;
}

function parseRecipeForm(formData: FormData) {
  let ingredients: unknown[];
  let steps: unknown[];

  try {
    ingredients = parseRows(formData.get("ingredients"), "ingredients").filter(
      (row) => {
        if (!row || typeof row !== "object") {
          return true;
        }

        const values = Object.values(row);
        return values.some((value) => value !== "" && value !== null);
      },
    );
    steps = parseRows(formData.get("steps"), "steps").filter((row) => {
      if (!row || typeof row !== "object" || !("text" in row)) {
        return true;
      }

      return typeof row.text !== "string" || row.text.trim() !== "";
    });
  } catch {
    return {
      success: false as const,
      errors: ["The recipe form could not be read. Please try again."],
    };
  }

  const parsed = createRecipeSchema.safeParse({
    title: formData.get("title"),
    tags: formData.get("tags"),
    ingredients,
    steps,
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return {
    success: true as const,
    data: parsed.data,
  };
}

const maximumPhotoSize = 4 * 1024 * 1024;

function detectPhotoMimeType(
  bytes: Uint8Array,
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

async function parseRecipePhoto(
  formData: FormData,
): Promise<
  | { success: true; photo: RecipePhotoUpdate }
  | { success: false; errors: string[] }
> {
  if (formData.get("removePhoto") === "true") {
    return { success: true, photo: null };
  }

  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return { success: true, photo: undefined };
  }

  if (file.size > maximumPhotoSize) {
    return {
      success: false,
      errors: ["Choose a recipe photo smaller than 4 MB."],
    };
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectPhotoMimeType(data);

  if (!mimeType) {
    return {
      success: false,
      errors: ["Recipe photos must be JPEG, PNG, or WebP files."],
    };
  }

  return {
    success: true,
    photo: {
      data,
      mimeType,
    },
  };
}

export async function createRecipeAction(
  _previousState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const parsed = parseRecipeForm(formData);
  const parsedPhoto = await parseRecipePhoto(formData);

  if (!parsed.success || !parsedPhoto.success) {
    return {
      errors: [
        ...(parsed.success ? [] : parsed.errors),
        ...(parsedPhoto.success ? [] : parsedPhoto.errors),
      ],
    };
  }

  let recipe;

  try {
    recipe = await createRecipe(parsed.data, parsedPhoto.photo ?? null);
  } catch {
    return {
      errors: ["The recipe could not be saved. Please try again."],
    };
  }

  revalidatePath("/");
  redirect(`/recipe/${recipe.slug}`);
}

export async function updateRecipeAction(
  recipeId: string,
  previousSlug: string,
  _previousState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const parsed = parseRecipeForm(formData);
  const parsedPhoto = await parseRecipePhoto(formData);

  if (!parsed.success || !parsedPhoto.success) {
    return {
      errors: [
        ...(parsed.success ? [] : parsed.errors),
        ...(parsedPhoto.success ? [] : parsedPhoto.errors),
      ],
    };
  }

  let recipe;

  try {
    recipe = await updateRecipe(recipeId, parsed.data, parsedPhoto.photo);
  } catch {
    return {
      errors: ["The recipe could not be updated. Please try again."],
    };
  }

  revalidatePath("/");
  revalidatePath(`/recipe/${previousSlug}`);
  revalidatePath(`/recipe/${recipe.slug}`);
  redirect(`/recipe/${recipe.slug}`);
}

export async function deleteRecipeAction(
  recipeId: string,
  _formData: FormData,
) {
  void _formData;
  await deleteRecipe(recipeId);
  revalidatePath("/");
  redirect("/");
}

export async function toggleRecipeFavoriteAction(
  recipeId: string,
  slug: string,
  _formData: FormData,
) {
  void _formData;
  await toggleRecipeFavorite(recipeId);
  revalidatePath("/");
  revalidatePath(`/recipe/${slug}`);
}
