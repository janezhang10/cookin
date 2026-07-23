export type IngredientTokenPart =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "ingredient";
      name: string;
      raw: string;
    };

function ingredientTokenPattern() {
  return /\[\[([^[\]]+)\]\]/g;
}

export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase();
}

export function createIngredientToken(name: string): string {
  return `[[${name.trim()}]]`;
}

export function extractIngredientTokenNames(markdown: string): string[] {
  return Array.from(markdown.matchAll(ingredientTokenPattern()), (match) =>
    match[1].trim(),
  );
}

export function renameIngredientTokens(
  markdown: string,
  previousName: string,
  nextName: string,
): string {
  const normalizedPreviousName = normalizeIngredientName(previousName);

  if (!normalizedPreviousName) {
    return markdown;
  }

  return markdown.replace(ingredientTokenPattern(), (raw, name: string) =>
    normalizeIngredientName(name) === normalizedPreviousName
      ? createIngredientToken(nextName)
      : raw,
  );
}

export function parseIngredientTokens(markdown: string): IngredientTokenPart[] {
  const parts: IngredientTokenPart[] = [];
  let cursor = 0;

  for (const match of markdown.matchAll(ingredientTokenPattern())) {
    const index = match.index;

    if (index > cursor) {
      parts.push({
        type: "text",
        value: markdown.slice(cursor, index),
      });
    }

    parts.push({
      type: "ingredient",
      name: match[1].trim(),
      raw: match[0],
    });

    cursor = index + match[0].length;
  }

  if (cursor < markdown.length) {
    parts.push({
      type: "text",
      value: markdown.slice(cursor),
    });
  }

  return parts;
}
