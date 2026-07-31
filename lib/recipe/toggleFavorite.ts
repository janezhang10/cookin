import { eq } from "drizzle-orm";

import { recipes } from "@/db/schema";
import { getDb } from "@/lib/db/client";

export async function toggleRecipeFavorite(recipeId: string) {
  const db = await getDb();
  const [recipe] = await db
    .select({ isFavorite: recipes.isFavorite })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) {
    return null;
  }

  const isFavorite = !recipe.isFavorite;
  await db
    .update(recipes)
    .set({ isFavorite, updatedAt: new Date().toISOString() })
    .where(eq(recipes.id, recipeId));

  return { isFavorite };
}
