export const recipeInclude = {
  tags: {
    include: {
      tag: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
  },
  ingredients: {
    include: {
      ingredient: true,
      unit: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
  },
  steps: {
    include: {
      ingredientUsages: {
        include: {
          recipeIngredient: {
            include: {
              ingredient: true,
              unit: true,
            },
          },
        },
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
    orderBy: {
      stepNumber: "asc",
    },
  },
} as const;
