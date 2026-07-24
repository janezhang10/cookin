"use client";

import { useEffect, useState } from "react";

import { RecipeMarkdown } from "@/lib/markdown/renderer";
import { formatQuantity, scaleQuantity } from "@/lib/recipe/scale";

import { UnitConverter } from "./unit-converter";

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

function IngredientChecklist({
  ingredients,
  divisor,
  checkedIngredientIds,
  onToggle,
  onClear,
}: {
  ingredients: Ingredient[];
  divisor: number;
  checkedIngredientIds: Set<string>;
  onToggle: (ingredientId: string) => void;
  onClear: () => void;
}) {
  return (
    <>
      <div className="ingredient-progress">
        <span aria-live="polite">
          {checkedIngredientIds.size} of {ingredients.length} checked
        </span>
        {checkedIngredientIds.size > 0 && (
          <button type="button" className="text-button" onClick={onClear}>
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
                  onChange={() => onToggle(ingredient.id)}
                />
                <span className="ingredient-amount">{amount}</span>
                <span className="ingredient-name">{ingredient.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function RecipeContent({
  title,
  ingredients,
  steps,
}: {
  title: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}) {
  const [divisor, setDivisor] = useState<number>(1);
  const [checkedIngredientIds, setCheckedIngredientIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isCooking, setIsCooking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isCooking) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCooking(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCooking]);

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

  function startCooking() {
    setCurrentStepIndex(0);
    setIsCooking(true);
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

        <IngredientChecklist
          ingredients={ingredients}
          divisor={divisor}
          checkedIngredientIds={checkedIngredientIds}
          onToggle={toggleIngredient}
          onClear={() => setCheckedIngredientIds(new Set())}
        />
      </section>

      <section className="recipe-panel">
        <div className="recipe-panel-heading">
          <h2>Instructions</h2>
          <button
            type="button"
            className="button compact-button"
            disabled={steps.length === 0}
            onClick={startCooking}
          >
            Start cooking
          </button>
        </div>
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

      <section className="recipe-panel">
        <h2>Unit converter</h2>
        <p className="panel-description">
          Convert common cooking weights and volumes without changing the
          recipe.
        </p>
        <UnitConverter />
      </section>

      {isCooking && currentStep && (
        <div
          className="cooking-mode"
          role="dialog"
          aria-modal="true"
          aria-label={`Cooking ${title}`}
        >
          <div className="cooking-mode-shell">
            <header className="cooking-mode-header">
              <div>
                <p>Cooking mode</p>
                <h2>{title}</h2>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => setIsCooking(false)}
              >
                Exit
              </button>
            </header>

            <section className="cooking-step" aria-live="polite">
              <p className="cooking-step-number">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
              <progress value={currentStepIndex + 1} max={steps.length}>
                Step {currentStepIndex + 1} of {steps.length}
              </progress>
              <RecipeMarkdown
                markdown={currentStep.markdown}
                ingredients={ingredients}
                divisor={divisor}
              />
            </section>

            <details className="cooking-ingredients">
              <summary>
                Ingredients · {ingredients.length - checkedIngredientIds.size}{" "}
                remaining
              </summary>
              <IngredientChecklist
                ingredients={ingredients}
                divisor={divisor}
                checkedIngredientIds={checkedIngredientIds}
                onToggle={toggleIngredient}
                onClear={() => setCheckedIngredientIds(new Set())}
              />
            </details>

            <details className="cooking-ingredients">
              <summary>Unit converter</summary>
              <UnitConverter />
            </details>

            <nav className="cooking-navigation" aria-label="Cooking steps">
              <button
                type="button"
                className="cooking-nav-button"
                disabled={currentStepIndex === 0}
                onClick={() =>
                  setCurrentStepIndex((current) => Math.max(0, current - 1))
                }
              >
                Previous
              </button>
              <button
                type="button"
                className="button"
                onClick={() => {
                  if (currentStepIndex === steps.length - 1) {
                    setIsCooking(false);
                  } else {
                    setCurrentStepIndex((current) => current + 1);
                  }
                }}
              >
                {currentStepIndex === steps.length - 1
                  ? "Finish cooking"
                  : "Next step"}
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
