"use client";

import { useState } from "react";

import { RecipeMarkdown } from "@/lib/markdown/renderer";
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

export function RecipeContent({
  ingredients,
  steps,
}: {
  ingredients: Ingredient[];
  steps: RecipeStep[];
}) {
  const [divisor, setDivisor] = useState<number>(1);

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
              <RecipeMarkdown
                markdown={step.markdown}
                ingredients={ingredients}
                divisor={divisor}
              />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
