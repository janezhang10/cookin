import { asc } from "drizzle-orm";

import { recipes } from "@/db/schema";
import { getDb } from "@/lib/db/client";

import { getRecipeIngredients, getRecipeTags } from "./get";

export async function listRecipes() {
  const db = await getDb();
  const recipeRows = await db
    .select()
    .from(recipes)
    .orderBy(asc(recipes.title));

  return Promise.all(
    recipeRows.map(async (recipe) => ({
      ...recipe,
      tags: await getRecipeTags(db, recipe.id),
      ingredients: await getRecipeIngredients(db, recipe.id),
    })),
  );
}
