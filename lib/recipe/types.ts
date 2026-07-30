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
  tags: string[];
  ingredients: CreateRecipeIngredientInput[];
  steps: CreateRecipeStepInput[];
}

export interface RecipePhotoInput {
  data: Uint8Array<ArrayBuffer>;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}

export type RecipePhotoUpdate = RecipePhotoInput | null | undefined;
