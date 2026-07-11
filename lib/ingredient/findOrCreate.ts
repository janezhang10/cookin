import { prisma } from "@/lib/db/client";

export async function findOrCreateIngredient(name: string) {
  const normalized = name.trim().toLowerCase();

  return prisma.ingredient.upsert({
    where: {
      normalizedName: normalized,
    },
    update: {},
    create: {
      name: name.trim(),
      normalizedName: normalized,
    },
  });
}