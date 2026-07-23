"use client";

import { useState } from "react";

import {
  normalizeIngredientName,
  parseIngredientTokens,
} from "@/lib/markdown/ingredientTokens";
import { formatQuantity, scaleQuantity } from "@/lib/recipe/scale";

interface Ingredient {
  id: string;
  quantity: number | null;
  unitAbbreviation: string | null;
  name: string;
}

interface RecipeStep {
  id: string;
  markdown: string;
}

const DIVISORS = [1, 2, 3, 4] as const;

function formatIngredientReference(ingredient: Ingredient, divisor: number) {
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

export function RecipeContent({
  ingredients,
  steps,
}: {
  ingredients: Ingredient[];
  steps: RecipeStep[];
}) {
  const [divisor, setDivisor] = useState<number>(1);
  const ingredientsByName = new Map(
    ingredients.map((ingredient) => [
      normalizeIngredientName(ingredient.name),
      ingredient,
    ]),
  );

  return (
    <div className="recipe-content">
      <section className="recipe-panel">
        <div className="recipe-panel-heading">
          <h2>Ingredients</h2>

          <div className="scale-control">
            <span>Divide by</span>
            <div className="scale-options" role="group" aria-label="Divide by">
              {DIVISORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="scale-option"
                  aria-pressed={divisor === option}
                  onClick={() => setDivisor(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {divisor === 1
            ? "Showing original ingredient quantities."
            : `Ingredient quantities divided by ${divisor}.`}
        </p>

        <ul className="ingredient-list">
          {ingredients.map((ingredient) => {
            const scaledQuantity = scaleQuantity(ingredient.quantity, divisor);
            const amount =
              scaledQuantity === null
                ? ""
                : [formatQuantity(scaledQuantity), ingredient.unitAbbreviation]
                    .filter(Boolean)
                    .join(" ");

            return (
              <li key={ingredient.id}>
                <span className="ingredient-amount">{amount}</span>
                <span>{ingredient.name}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="recipe-panel">
        <h2>Instructions</h2>
        <ol className="instruction-list">
          {steps.map((step) => (
            <li key={step.id}>
              <span className="instruction-text">
                {parseIngredientTokens(step.markdown).map((part, index) => {
                  if (part.type === "text") {
                    return <span key={index}>{part.value}</span>;
                  }

                  const ingredient = ingredientsByName.get(
                    normalizeIngredientName(part.name),
                  );

                  if (!ingredient) {
                    return <span key={index}>{part.raw}</span>;
                  }

                  return (
                    <span className="ingredient-reference" key={index}>
                      {formatIngredientReference(ingredient, divisor)}
                    </span>
                  );
                })}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
