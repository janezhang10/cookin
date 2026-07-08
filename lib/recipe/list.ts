import { prisma } from "@/lib/db/client";

export async function listRecipes() {
  return prisma.recipe.findMany({
    orderBy: {
      title: "asc",
    },
  });
}