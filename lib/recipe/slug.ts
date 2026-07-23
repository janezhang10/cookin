import { prisma } from "@/lib/db/client";

function slugify(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "recipe";
}

export async function generateSlug(title: string): Promise<string> {
  const base = slugify(title);

  let slug = base;
  let counter = 2;

  while (true) {
    const exists = await prisma.recipe.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!exists) {
      return slug;
    }

    slug = `${base}-${counter++}`;
  }
}
