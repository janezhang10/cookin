import {
  normalizeIngredientName,
  parseIngredientTokens,
} from "@/lib/markdown/ingredientTokens";
import { formatQuantity, scaleQuantity } from "@/lib/recipe/scale";

export interface MarkdownIngredient {
  quantity: number | null;
  unitAbbreviation: string | null;
  name: string;
}

const INGREDIENT_URL_PREFIX = "ingredient:";

function escapeMarkdownLinkLabel(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");
}

function formatIngredientReference(
  ingredient: MarkdownIngredient,
  divisor: number,
): string {
  const quantity = scaleQuantity(ingredient.quantity, divisor);

  if (quantity === null) {
    return ingredient.name;
  }

  return [
    formatQuantity(quantity),
    ingredient.unitAbbreviation,
    ingredient.name,
  ]
    .filter(Boolean)
    .join(" ");
}

export function isIngredientUrl(url: string | undefined): boolean {
  return url?.startsWith(INGREDIENT_URL_PREFIX) ?? false;
}

export function prepareRecipeMarkdown(
  markdown: string,
  ingredients: MarkdownIngredient[],
  divisor: number,
): string {
  const ingredientsByName = new Map(
    ingredients.map((ingredient) => [
      normalizeIngredientName(ingredient.name),
      ingredient,
    ]),
  );

  return parseIngredientTokens(markdown)
    .map((part) => {
      if (part.type === "text") {
        return part.value;
      }

      const normalizedName = normalizeIngredientName(part.name);
      const ingredient = ingredientsByName.get(normalizedName);

      if (!ingredient) {
        return part.raw;
      }

      const label = escapeMarkdownLinkLabel(
        formatIngredientReference(ingredient, divisor),
      );

      return `[${label}](${INGREDIENT_URL_PREFIX}${encodeURIComponent(normalizedName)})`;
    })
    .join("");
}
