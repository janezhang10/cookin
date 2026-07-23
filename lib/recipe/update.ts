import { findOrCreateIngredient } from "@/lib/ingredient/findOrCreate";
import { prisma } from "@/lib/db/client";

import { recipeInclude } from "./include";
import { generateSlug } from "./slug";
import type { CreateRecipeInput } from "./types";

export async function updateRecipe(recipeId: string, input: CreateRecipeInput) {
  const slug = await generateSlug(input.title, recipeId);

  return prisma.$transaction(async (tx) => {
    await tx.recipeStep.deleteMany({
      where: { recipeId },
    });
    await tx.recipeIngredient.deleteMany({
      where: { recipeId },
    });

    await tx.recipe.update({
      where: { id: recipeId },
      data: {
        title: input.title.trim(),
        slug,
      },
    });

    for (const [displayOrder, inputIngredient] of input.ingredients.entries()) {
      const ingredient = await findOrCreateIngredient(
        tx,
        inputIngredient.ingredient,
      );

      await tx.recipeIngredient.create({
        data: {
          recipeId,
          ingredientId: ingredient.id,
          quantity: inputIngredient.quantity,
          unitId: inputIngredient.unitId,
          displayOrder,
        },
      });
    }

    await tx.recipeStep.createMany({
      data: input.steps.map((step, index) => ({
        recipeId,
        stepNumber: index + 1,
        markdown: step.text.trim(),
      })),
    });

    return tx.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      include: recipeInclude,
    });
  });
}
