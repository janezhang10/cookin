/*
  Warnings:

  - You are about to drop the column `description` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `yield` on the `Recipe` table. All the data in the column will be lost.
  - Added the required column `normalizedName` to the `Ingredient` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Ingredient" ("createdAt", "id", "name", "normalizedName", "updatedAt")
SELECT "createdAt", "id", "name", lower(trim("name")), "updatedAt" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
CREATE UNIQUE INDEX "Ingredient_normalizedName_key" ON "Ingredient"("normalizedName");
CREATE INDEX "Ingredient_name_idx" ON "Ingredient"("name");
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Recipe" ("createdAt", "id", "slug", "title", "updatedAt") SELECT "createdAt", "id", "slug", "title", "updatedAt" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");
CREATE INDEX "Recipe_title_idx" ON "Recipe"("title");
CREATE TABLE "new_RecipeIngredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" REAL,
    "unitId" TEXT,
    "preparation" TEXT,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RecipeIngredient" ("createdAt", "displayOrder", "id", "ingredientId", "optional", "preparation", "quantity", "recipeId", "unitId", "updatedAt") SELECT "createdAt", "displayOrder", "id", "ingredientId", "optional", "preparation", "quantity", "recipeId", "unitId", "updatedAt" FROM "RecipeIngredient";
DROP TABLE "RecipeIngredient";
ALTER TABLE "new_RecipeIngredient" RENAME TO "RecipeIngredient";
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");
CREATE INDEX "RecipeIngredient_ingredientId_idx" ON "RecipeIngredient"("ingredientId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
