import { prisma } from "@/lib/db/client";

export async function listRecipes() {
  return prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      ingredients: {
        select: {
          ingredient: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });
}
