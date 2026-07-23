import { prisma } from "@/lib/db/client";
import { findOrCreateIngredient } from "@/lib/ingredient/findOrCreate";

import { generateSlug } from "./slug";
import { recipeInclude } from "./include";
import type { CreateRecipeInput } from "./types";

export async function createRecipe(input: CreateRecipeInput) {
  const slug = await generateSlug(input.title);

  return prisma.$transaction(async (tx) => {
    const recipe = await tx.recipe.create({
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
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          quantity: inputIngredient.quantity,
          unitId: inputIngredient.unitId,
          displayOrder,
        },
      });
    }

    await tx.recipeStep.createMany({
      data: input.steps.map((step, index) => ({
        recipeId: recipe.id,
        stepNumber: index + 1,
        markdown: step.text.trim(),
      })),
    });

    return tx.recipe.findUniqueOrThrow({
      where: { id: recipe.id },
      include: recipeInclude,
    });
  });
}
