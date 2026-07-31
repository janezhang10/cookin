import { eq } from "drizzle-orm";

import { ingredients } from "@/db/schema";
import type { CookinDb } from "@/lib/db/client";

export async function findOrCreateIngredient(
  db: CookinDb,
  name: string,
) {
  const normalized = name.trim().toLowerCase();
  const [existing] = await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.normalizedName, normalized))
    .limit(1);

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const ingredient = {
    id: crypto.randomUUID(),
    name: name.trim(),
    normalizedName: normalized,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(ingredients).values(ingredient);
  return ingredient;
}
