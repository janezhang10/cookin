import { eq } from "drizzle-orm";

import { recipes } from "@/db/schema";
import { getDb } from "@/lib/db/client";

function slugify(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "recipe";
}

export async function generateSlug(
  title: string,
  existingRecipeId?: string,
): Promise<string> {
  const db = await getDb();
  const base = slugify(title);

  let slug = base;
  let counter = 2;

  while (true) {
    const [exists] = await db
      .select({ id: recipes.id })
      .from(recipes)
      .where(eq(recipes.slug, slug))
      .limit(1);

    if (!exists || exists.id === existingRecipeId) {
      return slug;
    }

    slug = `${base}-${counter++}`;
  }
}
