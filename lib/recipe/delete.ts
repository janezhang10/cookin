import { prisma } from "@/lib/db/client";

export async function deleteRecipe(recipeId: string) {
  return prisma.recipe.delete({
    where: { id: recipeId },
  });
}
