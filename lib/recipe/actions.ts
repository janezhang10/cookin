"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createRecipe } from "@/lib/recipe/create";
import { createRecipeSchema } from "@/lib/validation/recipe";

export interface CreateRecipeActionState {
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

export async function createRecipeAction(
  _previousState: CreateRecipeActionState,
  formData: FormData,
): Promise<CreateRecipeActionState> {
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
      errors: parsed.error.issues.map((issue) => issue.message),
    };
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
