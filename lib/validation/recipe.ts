import { z } from "zod";

import {
  extractIngredientTokenNames,
  normalizeIngredientName,
} from "@/lib/markdown/ingredientTokens";

const nullableQuantitySchema = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? null : value,
  z.coerce.number().positive("Quantity must be greater than zero.").nullable(),
);

const nullableUnitIdSchema = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? null : value,
  z.string().min(1).nullable(),
);

export const createRecipeSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200),
    ingredients: z
      .array(
        z.object({
          quantity: nullableQuantitySchema,
          unitId: nullableUnitIdSchema,
          ingredient: z.string().trim().min(1, "Ingredient name is required."),
        }),
      )
      .min(1, "Add at least one ingredient."),
    steps: z
      .array(
        z.object({
          text: z.string().trim().min(1, "Instruction text is required."),
        }),
      )
      .min(1, "Add at least one instruction."),
  })
  .superRefine((recipe, context) => {
    const ingredientNames = new Set(
      recipe.ingredients.map(({ ingredient }) =>
        normalizeIngredientName(ingredient),
      ),
    );

    recipe.steps.forEach((step, stepIndex) => {
      for (const name of extractIngredientTokenNames(step.text)) {
        if (!ingredientNames.has(normalizeIngredientName(name))) {
          context.addIssue({
            code: "custom",
            path: ["steps", stepIndex, "text"],
            message: `Instruction ${stepIndex + 1} references "${name}", which is not in the ingredient list.`,
          });
        }
      }
    });
  });

export type CreateRecipeForm = z.infer<typeof createRecipeSchema>;
