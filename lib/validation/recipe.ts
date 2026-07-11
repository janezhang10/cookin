import { z } from "zod";

export const createRecipeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200),

  description: z.string().trim().optional(),

  yield: z.string().trim().optional(),

  notes: z.string().trim().optional(),
});

export type CreateRecipeForm = z.infer<typeof createRecipeSchema>;