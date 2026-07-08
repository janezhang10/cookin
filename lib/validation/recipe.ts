import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  notes: z.string().optional(),
});