import { eq } from "drizzle-orm";

import { tags } from "@/db/schema";
import type { CookinDb } from "@/lib/db/client";

export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase();
}

export async function findOrCreateTag(
  db: CookinDb,
  name: string,
) {
  const normalizedName = normalizeTagName(name);
  const [existing] = await db
    .select()
    .from(tags)
    .where(eq(tags.normalizedName, normalizedName))
    .limit(1);

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const tag = {
    id: crypto.randomUUID(),
    name: name.trim(),
    normalizedName,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(tags).values(tag);
  return tag;
}
