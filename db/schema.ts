import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updatedAt").notNull(),
};

export const recipes = sqliteTable(
  "Recipe",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    isFavorite: integer("isFavorite", { mode: "boolean" })
      .notNull()
      .default(false),
    photoKey: text("photoKey"),
    photoMimeType: text("photoMimeType"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("Recipe_slug_key").on(table.slug),
    index("Recipe_title_idx").on(table.title),
  ],
);

export const tags = sqliteTable(
  "Tag",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalizedName").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("Tag_normalizedName_key").on(table.normalizedName),
    index("Tag_name_idx").on(table.name),
  ],
);

export const recipeTags = sqliteTable(
  "RecipeTag",
  {
    id: text("id").primaryKey(),
    recipeId: text("recipeId")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    tagId: text("tagId")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    displayOrder: integer("displayOrder").notNull(),
    createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("RecipeTag_recipeId_tagId_key").on(
      table.recipeId,
      table.tagId,
    ),
    index("RecipeTag_recipeId_idx").on(table.recipeId),
    index("RecipeTag_tagId_idx").on(table.tagId),
  ],
);

export const ingredients = sqliteTable(
  "Ingredient",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalizedName").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("Ingredient_normalizedName_key").on(table.normalizedName),
    index("Ingredient_name_idx").on(table.name),
  ],
);

export const units = sqliteTable(
  "Unit",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    abbreviation: text("abbreviation").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("Unit_name_key").on(table.name)],
);

export const recipeIngredients = sqliteTable(
  "RecipeIngredient",
  {
    id: text("id").primaryKey(),
    recipeId: text("recipeId")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    ingredientId: text("ingredientId")
      .notNull()
      .references(() => ingredients.id),
    quantity: real("quantity"),
    unitId: text("unitId").references(() => units.id, {
      onDelete: "set null",
    }),
    preparation: text("preparation"),
    optional: integer("optional", { mode: "boolean" })
      .notNull()
      .default(false),
    displayOrder: integer("displayOrder").notNull(),
    ...timestamps,
  },
  (table) => [
    index("RecipeIngredient_recipeId_idx").on(table.recipeId),
    index("RecipeIngredient_ingredientId_idx").on(table.ingredientId),
  ],
);

export const recipeSteps = sqliteTable(
  "RecipeStep",
  {
    id: text("id").primaryKey(),
    recipeId: text("recipeId")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    stepNumber: integer("stepNumber").notNull(),
    markdown: text("markdown").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("RecipeStep_recipeId_stepNumber_key").on(
      table.recipeId,
      table.stepNumber,
    ),
    index("RecipeStep_recipeId_idx").on(table.recipeId),
  ],
);

export const recipeStepIngredientUsages = sqliteTable(
  "RecipeStepIngredientUsage",
  {
    id: text("id").primaryKey(),
    recipeStepId: text("recipeStepId")
      .notNull()
      .references(() => recipeSteps.id, { onDelete: "cascade" }),
    recipeIngredientId: text("recipeIngredientId")
      .notNull()
      .references(() => recipeIngredients.id, { onDelete: "cascade" }),
    quantity: real("quantity").notNull(),
    displayOrder: integer("displayOrder").notNull(),
    createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("RecipeStepIngredientUsage_recipeStepId_idx").on(table.recipeStepId),
    index("RecipeStepIngredientUsage_recipeIngredientId_idx").on(
      table.recipeIngredientId,
    ),
  ],
);
