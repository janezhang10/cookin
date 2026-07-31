import { eq } from "drizzle-orm";

import { recipes } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { deleteRecipePhoto } from "@/lib/storage/photos";

export async function deleteRecipe(recipeId: string) {
  const db = await getDb();
  const [recipe] = await db
    .select({ photoKey: recipes.photoKey })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  await db.delete(recipes).where(eq(recipes.id, recipeId));

  if (recipe?.photoKey) {
    await deleteRecipePhoto(recipe.photoKey);
  }
}
