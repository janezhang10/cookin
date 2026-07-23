import { prisma } from "@/lib/db/client";

import { recipeInclude } from "./include";

export async function getRecipeBySlug(slug: string) {
  return prisma.recipe.findUnique({
    where: { slug },
    include: recipeInclude,
  });
}
