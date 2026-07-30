import { prisma } from "@/lib/db/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: {
      photoData: true,
      photoMimeType: true,
    },
  });

  if (!recipe?.photoData || !recipe.photoMimeType) {
    return new Response(null, { status: 404 });
  }

  const bytes = Uint8Array.from(recipe.photoData);

  return new Response(bytes.buffer, {
    headers: {
      "Content-Type": recipe.photoMimeType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
