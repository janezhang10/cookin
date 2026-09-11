"use client";

import { useEffect, useRef, useState } from "react";

import { RecipeMarkdown } from "@/lib/markdown/renderer";
import { formatQuantity, scaleQuantity } from "@/lib/recipe/scale";

import { UnitConverter } from "../unit-converter";
import { CookingTimer } from "./cooking-timer";

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

const SCALE_PRESETS = [1, 2, 3, 4] as const;

function ScaleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const isCustom = !(SCALE_PRESETS as readonly number[]).includes(value);

  function commitDraft() {
    if (draft === null) {
      return;
    }
    const trimmed = draft.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed) || /^\.\d+$/.test(trimmed)) {
      const parsed = parseFloat(trimmed);
      if (Number.isFinite(parsed) && parsed > 0) {
        onChange(parsed);
      }
    }
    setDraft(null);
  }

  return (
    <div className="scale-control">
      <span className="scale-label">{label}</span>
      <div className="scale-options" role="group" aria-label={label}>
        {SCALE_PRESETS.map((option) => (
          <button
            key={option}
            type="button"
            className="scale-option"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`scale-custom${isCustom ? " is-custom" : ""}`}
          aria-label={`${label} (custom value)`}
          title="Type a custom value, then press Enter"
          value={draft ?? String(value)}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            } else if (event.key === "Escape") {
              setDraft(null);
            }
          }}
        />
      </div>
    </div>
  );
}

function describeScale(multiplier: number, divisor: number): string {
  if (multiplier === 1 && divisor === 1) {
    return "Showing original ingredient quantities.";
  }
  const parts: string[] = [];
  if (multiplier !== 1) {
    parts.push(`multiplied by ${multiplier}`);
  }
  if (divisor !== 1) {
    parts.push(`divided by ${divisor}`);
  }
  return `Ingredient quantities ${parts.join(" and ")}.`;
}

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
  const [multiplier, setMultiplier] = useState<number>(1);
  const effectiveDivisor = divisor / multiplier;
  const [checkedIngredientIds, setCheckedIngredientIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isCooking, setIsCooking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const startCookingButtonRef = useRef<HTMLButtonElement>(null);
  const cookingModeRef = useRef<HTMLDivElement>(null);
  const exitCookingButtonRef = useRef<HTMLButtonElement>(null);
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isCooking) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const startCookingButton = startCookingButtonRef.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCooking(false);
        return;
      }

      if (event.key !== "Tab" || !cookingModeRef.current) {
        return;
      }

      const focusableElements = Array.from(
        cookingModeRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), summary, [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          !cookingModeRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    exitCookingButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      startCookingButton?.focus();
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

          <div className="scale-controls">
            <ScaleRow
              label="Multiply by"
              value={multiplier}
              onChange={setMultiplier}
            />
            <ScaleRow label="Divide by" value={divisor} onChange={setDivisor} />
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {describeScale(multiplier, divisor)}
        </p>

        <IngredientChecklist
          ingredients={ingredients}
          divisor={effectiveDivisor}
          checkedIngredientIds={checkedIngredientIds}
          onToggle={toggleIngredient}
          onClear={() => setCheckedIngredientIds(new Set())}
        />
      </section>

      <section className="recipe-panel">
        <div className="recipe-panel-heading">
          <h2>Instructions</h2>
          <button
            ref={startCookingButtonRef}
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
                divisor={effectiveDivisor}
              />
            </li>
          ))}
        </ol>

        <CookingTimer />
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
          ref={cookingModeRef}
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
                ref={exitCookingButtonRef}
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
                divisor={effectiveDivisor}
              />
            </section>

            <CookingTimer />

            <details className="cooking-ingredients">
              <summary>
                Ingredients · {ingredients.length - checkedIngredientIds.size}{" "}
                remaining
              </summary>
              <IngredientChecklist
                ingredients={ingredients}
                divisor={effectiveDivisor}
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
