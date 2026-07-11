"use server";

import { redirect } from "next/navigation";

import { createRecipe } from "@/lib/recipe/create";
import { createRecipeSchema } from "@/lib/validation/recipe";

export async function createRecipeAction(formData: FormData) {
  const parsed = createRecipeSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    yield: formData.get("yield"),
    notes: formData.get("notes"),
  });

  const recipe = await createRecipe(parsed);

  redirect(`/recipe/${recipe.slug}`);
}