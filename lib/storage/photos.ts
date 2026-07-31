import { getCloudflareContext } from "@opennextjs/cloudflare";

function getPhotoBucket() {
  const bucket = getCloudflareContext().env.PHOTOS;

  if (!bucket) {
    throw new Error("Cloudflare R2 binding `PHOTOS` is not configured.");
  }

  return bucket;
}

export function recipePhotoKey(recipeId: string): string {
  return `recipes/${recipeId}`;
}

export async function saveRecipePhoto(
  recipeId: string,
  data: Uint8Array<ArrayBuffer>,
  mimeType: string,
) {
  const key = recipePhotoKey(recipeId);
  await getPhotoBucket().put(key, data, {
    httpMetadata: {
      contentType: mimeType,
    },
  });
  return key;
}

export async function getRecipePhoto(key: string) {
  return getPhotoBucket().get(key);
}

export async function deleteRecipePhoto(key: string) {
  await getPhotoBucket().delete(key);
}
