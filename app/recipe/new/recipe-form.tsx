"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import { createRecipeAction } from "@/lib/recipe/actions";

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

export function RecipeForm({ units }: { units: UnitOption[] }) {
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    emptyIngredient(0),
  ]);
  const [steps, setSteps] = useState<StepRow[]>([emptyStep(0)]);
  const nextIngredientId = useRef(1);
  const nextStepId = useRef(1);
  const [state, formAction, pending] = useActionState(
    createRecipeAction,
    { errors: [] },
  );

  function updateIngredient(
    id: number,
    field: keyof Omit<IngredientRow, "id">,
    value: string,
  ) {
    setIngredients((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  function updateStep(id: number, text: string) {
    setSteps((rows) =>
      rows.map((row) => (row.id === id ? { ...row, text } : row)),
    );
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
                value={step.text}
                rows={3}
                placeholder="Heat the butter..."
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
        <Link href="/" className="text-button">
          Cancel
        </Link>
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create recipe"}
        </button>
      </div>
    </form>
  );
}
