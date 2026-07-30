import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getRecipeBySlug } from "@/lib/recipe/get";

import { RecipeActions } from "./recipe-actions";
import { RecipeContent } from "./recipe-content";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <main id="main-content" className="container recipe-page" tabIndex={-1}>
      <Link href="/" className="back-link">
        ← All recipes
      </Link>

      <header className="page-header recipe-title-row">
        <div>
          <h1>{recipe.title}</h1>
          {recipe.tags.length > 0 && (
            <div className="recipe-tags" aria-label="Recipe tags">
              {recipe.tags.map(({ tag }) => (
                <span className="tag-chip" key={tag.id}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <RecipeActions
          recipeId={recipe.id}
          slug={recipe.slug}
          title={recipe.title}
          isFavorite={recipe.isFavorite}
        />
      </header>

      {recipe.photoMimeType && (
        <Image
          className="recipe-hero-photo"
          src={`/api/recipe/${recipe.id}/photo`}
          alt={recipe.title}
          width={1200}
          height={800}
          sizes="(max-width: 760px) 100vw, 760px"
          unoptimized
          priority
        />
      )}

      <RecipeContent
        title={recipe.title}
        ingredients={recipe.ingredients.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitAbbreviation: item.unit?.abbreviation ?? null,
          name: item.ingredient.name,
        }))}
        steps={recipe.steps.map((step) => ({
          id: step.id,
          markdown: step.markdown,
        }))}
      />
    </main>
  );
}
