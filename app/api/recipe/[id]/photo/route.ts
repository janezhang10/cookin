import { eq } from "drizzle-orm";

import { recipes } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { getRecipePhoto } from "@/lib/storage/photos";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = await getDb();
  const [recipe] = await db
    .select({
      photoKey: recipes.photoKey,
      photoMimeType: recipes.photoMimeType,
    })
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1);

  if (!recipe?.photoKey || !recipe.photoMimeType) {
    return new Response(null, { status: 404 });
  }

  const photo = await getRecipePhoto(recipe.photoKey);

  if (!photo) {
    return new Response(null, { status: 404 });
  }

  return new Response(photo.body, {
    headers: {
      "Content-Type": recipe.photoMimeType,
      "Content-Length": String(photo.size),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
