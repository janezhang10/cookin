import { asc, eq } from "drizzle-orm";

import {
  ingredients,
  recipeIngredients,
  recipes,
  recipeSteps,
  recipeTags,
  tags,
  units,
} from "@/db/schema";
import type { CookinDb } from "@/lib/db/client";
import { getDb } from "@/lib/db/client";

async function getRecipeTags(db: CookinDb, recipeId: string) {
  const rows = await db
    .select({
      id: recipeTags.id,
      displayOrder: recipeTags.displayOrder,
      tagId: tags.id,
      name: tags.name,
      normalizedName: tags.normalizedName,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
    })
    .from(recipeTags)
    .innerJoin(tags, eq(recipeTags.tagId, tags.id))
    .where(eq(recipeTags.recipeId, recipeId))
    .orderBy(asc(recipeTags.displayOrder));

  return rows.map(({ tagId, name, normalizedName, createdAt, updatedAt, ...row }) => ({
    ...row,
    recipeId,
    tagId,
    createdAt,
    tag: {
      id: tagId,
      name,
      normalizedName,
      createdAt,
      updatedAt,
    },
  }));
}

async function getRecipeIngredients(db: CookinDb, recipeId: string) {
  const rows = await db
    .select({
      id: recipeIngredients.id,
      ingredientId: ingredients.id,
      ingredientName: ingredients.name,
      ingredientNormalizedName: ingredients.normalizedName,
      quantity: recipeIngredients.quantity,
      unitId: recipeIngredients.unitId,
      unitName: units.name,
      unitAbbreviation: units.abbreviation,
      preparation: recipeIngredients.preparation,
      optional: recipeIngredients.optional,
      displayOrder: recipeIngredients.displayOrder,
      createdAt: recipeIngredients.createdAt,
      updatedAt: recipeIngredients.updatedAt,
    })
    .from(recipeIngredients)
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .leftJoin(units, eq(recipeIngredients.unitId, units.id))
    .where(eq(recipeIngredients.recipeId, recipeId))
    .orderBy(asc(recipeIngredients.displayOrder));

  return rows.map((row) => ({
    id: row.id,
    recipeId,
    ingredientId: row.ingredientId,
    quantity: row.quantity,
    unitId: row.unitId,
    preparation: row.preparation,
    optional: row.optional,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ingredient: {
      id: row.ingredientId,
      name: row.ingredientName,
      normalizedName: row.ingredientNormalizedName,
    },
    unit:
      row.unitId && row.unitName && row.unitAbbreviation
        ? {
            id: row.unitId,
            name: row.unitName,
            abbreviation: row.unitAbbreviation,
          }
        : null,
  }));
}

async function getRecipeSteps(db: CookinDb, recipeId: string) {
  const rows = await db
    .select()
    .from(recipeSteps)
    .where(eq(recipeSteps.recipeId, recipeId))
    .orderBy(asc(recipeSteps.stepNumber));

  return rows.map((step) => ({
    ...step,
    ingredientUsages: [],
  }));
}

export async function getRecipeBySlug(slug: string) {
  const db = await getDb();
  const [recipe] = await db
    .select()
    .from(recipes)
    .where(eq(recipes.slug, slug))
    .limit(1);

  if (!recipe) {
    return null;
  }

  const [recipeTagRows, ingredientRows, stepRows] = await Promise.all([
    getRecipeTags(db, recipe.id),
    getRecipeIngredients(db, recipe.id),
    getRecipeSteps(db, recipe.id),
  ]);

  return {
    ...recipe,
    tags: recipeTagRows,
    ingredients: ingredientRows,
    steps: stepRows,
  };
}

export { getRecipeIngredients, getRecipeTags };
