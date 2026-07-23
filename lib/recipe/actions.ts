"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createRecipe } from "@/lib/recipe/create";
import { deleteRecipe } from "@/lib/recipe/delete";
import { updateRecipe } from "@/lib/recipe/update";
import { createRecipeSchema } from "@/lib/validation/recipe";

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

export async function createRecipeAction(
  _previousState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const parsed = parseRecipeForm(formData);

  if (!parsed.success) {
    return { errors: parsed.errors };
  }

  let recipe;

  try {
    recipe = await createRecipe(parsed.data);
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

  if (!parsed.success) {
    return { errors: parsed.errors };
  }

  let recipe;

  try {
    recipe = await updateRecipe(recipeId, parsed.data);
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
