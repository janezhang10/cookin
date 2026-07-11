export interface CreateRecipeInput {
    title: string;
    description?: string;
    yield?: string;
    notes?: string;
}

export interface CreateRecipeIngredientInput {
  quantity: number | null;
  unitId: number | null;
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