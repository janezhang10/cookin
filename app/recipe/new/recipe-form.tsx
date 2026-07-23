"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import {
  createIngredientToken,
  renameIngredientTokens,
} from "@/lib/markdown/ingredientTokens";
import { createRecipeAction, updateRecipeAction } from "@/lib/recipe/actions";

interface UnitOption {
  id: string;
  name: string;
  abbreviation: string;
}

interface IngredientRow {
  id: number;
  quantity: string;
  unitId: string;
  ingredient: string;
}

interface StepRow {
  id: number;
  text: string;
}

export interface RecipeFormInitialData {
  id: string;
  slug: string;
  title: string;
  ingredients: Array<{
    quantity: number | null;
    unitId: string | null;
    ingredient: string;
  }>;
  steps: Array<{
    text: string;
  }>;
}

const emptyIngredient = (id: number): IngredientRow => ({
  id,
  quantity: "",
  unitId: "",
  ingredient: "",
});

const emptyStep = (id: number): StepRow => ({
  id,
  text: "",
});

export function RecipeForm({
  units,
  initialRecipe,
}: {
  units: UnitOption[];
  initialRecipe?: RecipeFormInitialData;
}) {
  const initialIngredients = initialRecipe?.ingredients.map(
    (ingredient, index) => ({
      id: index,
      quantity: ingredient.quantity === null ? "" : String(ingredient.quantity),
      unitId: ingredient.unitId ?? "",
      ingredient: ingredient.ingredient,
    }),
  ) ?? [emptyIngredient(0)];
  const initialSteps = initialRecipe?.steps.map((step, index) => ({
    id: index,
    text: step.text,
  })) ?? [emptyStep(0)];
  const [ingredients, setIngredients] =
    useState<IngredientRow[]>(initialIngredients);
  const [steps, setSteps] = useState<StepRow[]>(initialSteps);
  const nextIngredientId = useRef(initialIngredients.length);
  const nextStepId = useRef(initialSteps.length);
  const ingredientReferenceNames = useRef<Record<number, string>>(
    Object.fromEntries(
      initialIngredients.map((ingredient) => [
        ingredient.id,
        ingredient.ingredient,
      ]),
    ),
  );
  const stepTextareas = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const recipeAction = initialRecipe
    ? updateRecipeAction.bind(null, initialRecipe.id, initialRecipe.slug)
    : createRecipeAction;
  const [state, formAction, pending] = useActionState(recipeAction, {
    errors: [],
  });

  function updateIngredient(
    id: number,
    field: keyof Omit<IngredientRow, "id">,
    value: string,
  ) {
    if (field === "ingredient") {
      const currentName =
        ingredients.find((ingredient) => ingredient.id === id)?.ingredient ??
        "";
      const referenceName = ingredientReferenceNames.current[id] ?? currentName;

      if (value.trim()) {
        setSteps((currentSteps) =>
          currentSteps.map((step) => ({
            ...step,
            text: renameIngredientTokens(step.text, referenceName, value),
          })),
        );
        ingredientReferenceNames.current[id] = value;
      }
    }

    setIngredients((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  function updateStep(id: number, text: string) {
    setSteps((rows) =>
      rows.map((row) => (row.id === id ? { ...row, text } : row)),
    );
  }

  function insertIngredient(step: StepRow, ingredient: IngredientRow) {
    const textarea = stepTextareas.current[step.id];
    const start = textarea?.selectionStart ?? step.text.length;
    const end = textarea?.selectionEnd ?? start;
    const before = step.text.slice(0, start);
    const after = step.text.slice(end);
    const leadingSpace = before.length > 0 && !/\s$/.test(before) ? " " : "";
    const trailingSpace =
      after.length === 0 || (!/^\s/.test(after) && !/^[.,!?;:]/.test(after))
        ? " "
        : "";
    const insertion = `${leadingSpace}${createIngredientToken(
      ingredient.ingredient,
    )}${trailingSpace}`;
    const cursor = start + insertion.length;

    updateStep(step.id, `${before}${insertion}${after}`);

    requestAnimationFrame(() => {
      const currentTextarea = stepTextareas.current[step.id];
      currentTextarea?.focus();
      currentTextarea?.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <form action={formAction} className="recipe-form">
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          placeholder="Chicken Parmesan"
          defaultValue={initialRecipe?.title}
          required
          autoFocus
        />
      </div>

      <section className="form-section" aria-labelledby="ingredients-heading">
        <div className="section-heading">
          <div>
            <h2 id="ingredients-heading">Ingredients</h2>
            <p>Quantity and unit are optional.</p>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              const id = nextIngredientId.current++;
              setIngredients((rows) => [...rows, emptyIngredient(id)]);
            }}
          >
            + Add ingredient
          </button>
        </div>

        <div className="ingredient-header" aria-hidden="true">
          <span>Qty</span>
          <span>Unit</span>
          <span>Ingredient</span>
          <span />
        </div>

        <div className="ingredient-rows">
          {ingredients.map((row, index) => (
            <div className="ingredient-row" key={row.id}>
              <label className="sr-only" htmlFor={`quantity-${row.id}`}>
                Ingredient {index + 1} quantity
              </label>
              <input
                id={`quantity-${row.id}`}
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={row.quantity}
                placeholder="2"
                onChange={(event) =>
                  updateIngredient(row.id, "quantity", event.target.value)
                }
              />

              <label className="sr-only" htmlFor={`unit-${row.id}`}>
                Ingredient {index + 1} unit
              </label>
              <select
                id={`unit-${row.id}`}
                value={row.unitId}
                onChange={(event) =>
                  updateIngredient(row.id, "unitId", event.target.value)
                }
              >
                <option value="">No unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.abbreviation} — {unit.name}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor={`ingredient-${row.id}`}>
                Ingredient {index + 1} name
              </label>
              <input
                id={`ingredient-${row.id}`}
                type="text"
                value={row.ingredient}
                placeholder="Butter"
                aria-required="true"
                onChange={(event) =>
                  updateIngredient(row.id, "ingredient", event.target.value)
                }
              />

              <button
                className="remove-button"
                type="button"
                aria-label={`Remove ingredient ${index + 1}`}
                disabled={ingredients.length === 1}
                onClick={() =>
                  setIngredients((rows) =>
                    rows.filter((ingredient) => ingredient.id !== row.id),
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="form-section" aria-labelledby="steps-heading">
        <div className="section-heading">
          <div>
            <h2 id="steps-heading">Instructions</h2>
            <p>Keep each instruction in its own step.</p>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              const id = nextStepId.current++;
              setSteps((rows) => [...rows, emptyStep(id)]);
            }}
          >
            + Add step
          </button>
        </div>

        <ol className="step-rows">
          {steps.map((step, index) => (
            <li key={step.id}>
              <span className="step-number">{index + 1}</span>
              <label className="sr-only" htmlFor={`step-${step.id}`}>
                Instruction {index + 1}
              </label>
              <textarea
                id={`step-${step.id}`}
                ref={(textarea) => {
                  stepTextareas.current[step.id] = textarea;
                }}
                value={step.text}
                rows={3}
                placeholder="Heat the pan, then add..."
                aria-required="true"
                onChange={(event) => updateStep(step.id, event.target.value)}
              />
              <button
                className="remove-button"
                type="button"
                aria-label={`Remove instruction ${index + 1}`}
                disabled={steps.length === 1}
                onClick={() =>
                  setSteps((rows) =>
                    rows.filter((instruction) => instruction.id !== step.id),
                  )
                }
              >
                ×
              </button>
              <div className="ingredient-reference-picker">
                <span>Insert ingredient:</span>
                {ingredients
                  .filter(({ ingredient }) => ingredient.trim())
                  .map((ingredient) => (
                    <button
                      key={ingredient.id}
                      type="button"
                      onClick={() => insertIngredient(step, ingredient)}
                    >
                      + {ingredient.ingredient.trim()}
                    </button>
                  ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <input
        type="hidden"
        name="ingredients"
        value={JSON.stringify(
          ingredients.map(({ quantity, unitId, ingredient }) => ({
            quantity,
            unitId,
            ingredient,
          })),
        )}
      />
      <input
        type="hidden"
        name="steps"
        value={JSON.stringify(steps.map(({ text }) => ({ text })))}
      />

      {state.errors.length > 0 && (
        <div className="form-errors" role="alert">
          <p>Please fix the following:</p>
          <ul>
            {state.errors.map((error, index) => (
              <li key={`${error}-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-actions">
        <Link
          href={initialRecipe ? `/recipe/${initialRecipe.slug}` : "/"}
          className="text-button"
        >
          Cancel
        </Link>
        <button className="button" type="submit" disabled={pending}>
          {pending
            ? initialRecipe
              ? "Saving…"
              : "Creating…"
            : initialRecipe
              ? "Save changes"
              : "Create recipe"}
        </button>
      </div>
    </form>
  );
}
