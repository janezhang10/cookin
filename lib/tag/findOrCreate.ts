import type { Prisma } from "@/app/generated/prisma/client";

export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase();
}

export async function findOrCreateTag(
  tx: Prisma.TransactionClient,
  name: string,
) {
  const normalizedName = normalizeTagName(name);

  return tx.tag.upsert({
    where: {
      normalizedName,
    },
    update: {},
    create: {
      name: name.trim(),
      normalizedName,
    },
  });
}
