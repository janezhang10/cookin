import { prisma } from "@/lib/db/client";

export async function listRecipes() {
    return prisma.recipe.findUnique({
        where: { slug },
        include: recipeInclude,
    });
}