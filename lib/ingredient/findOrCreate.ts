import type { Prisma } from "@/app/generated/prisma/client";

export async function findOrCreateIngredient(
  tx: Prisma.TransactionClient,
  name: string,
) {
  const normalized = name.trim().toLowerCase();

  return tx.ingredient.upsert({
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
