export interface CreateRecipeIngredientInput {
  quantity: number | null;
  unitId: string | null;
  ingredient: string;
}

export interface CreateRecipeStepInput {
  text: string;
}

export interface CreateRecipeInput {
  title: string;
  ingredients: CreateRecipeIngredientInput[];
  steps: CreateRecipeStepInput[];
}
