export interface SearchableRecipe {
  title: string;
  ingredients: {
    ingredient: {
      name: string;
    };
  }[];
}

export function parseSearchTerms(query: string): string[] {
  return Array.from(
    new Set(
      query
        .split(",")
        .map((term) => term.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export function matchesRecipeSearch(
  recipe: SearchableRecipe,
  query: string,
): boolean {
  const terms = parseSearchTerms(query);

  if (terms.length === 0) {
    return true;
  }

  const ingredientNames = recipe.ingredients.map(({ ingredient }) =>
    ingredient.name.toLowerCase(),
  );

  if (terms.length > 1) {
    return terms.every((term) =>
      ingredientNames.some((ingredientName) => ingredientName.includes(term)),
    );
  }

  const [term] = terms;

  return (
    recipe.title.toLowerCase().includes(term) ||
    ingredientNames.some((ingredientName) => ingredientName.includes(term))
  );
}
