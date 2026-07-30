import { prisma } from "@/lib/db/client";

export async function toggleRecipeFavorite(recipeId: string) {
  return prisma.$transaction(async (tx) => {
    const recipe = await tx.recipe.findUnique({
      where: { id: recipeId },
      select: { isFavorite: true },
    });

    if (!recipe) {
      return null;
    }

    return tx.recipe.update({
      where: { id: recipeId },
      data: { isFavorite: !recipe.isFavorite },
      select: { isFavorite: true },
    });
  });
}
