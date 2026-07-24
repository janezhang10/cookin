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
  const [checkedIngredientIds, setCheckedIngredientIds] = useState<Set<string>>(
    () => new Set(),
  );

  function toggleIngredient(ingredientId: string) {
    setCheckedIngredientIds((current) => {
      const next = new Set(current);

      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }

      return next;
    });
  }

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

        <div className="ingredient-progress">
          <span aria-live="polite">
            {checkedIngredientIds.size} of {ingredients.length} checked
          </span>
          {checkedIngredientIds.size > 0 && (
            <button
              type="button"
              className="text-button"
              onClick={() => setCheckedIngredientIds(new Set())}
            >
              Clear checked
            </button>
          )}
        </div>

        <ul className="ingredient-list">
          {ingredients.map((ingredient) => {
            const scaledQuantity = scaleQuantity(ingredient.quantity, divisor);
            const isChecked = checkedIngredientIds.has(ingredient.id);
            const amount =
              scaledQuantity === null
                ? ""
                : [formatQuantity(scaledQuantity), ingredient.unitAbbreviation]
                    .filter(Boolean)
                    .join(" ");

            return (
              <li key={ingredient.id}>
                <label
                  className={`ingredient-check-row${
                    isChecked ? " is-checked" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleIngredient(ingredient.id)}
                  />
                  <span className="ingredient-amount">{amount}</span>
                  <span className="ingredient-name">{ingredient.name}</span>
                </label>
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
