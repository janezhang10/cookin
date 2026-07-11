import { prisma } from "@/lib/db/client";

import { generateSlug } from "./slug";
import type { CreateRecipeInput } from "./types";

export async function createRecipe(input: CreateRecipeInput) {
  const slug = await generateSlug(input.title);

  return prisma.recipe.create({
    data: {
      title: input.title.trim(),
      slug,
      description: input.description?.trim() || null,
      yield: input.yield?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });
}