"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";

import { ConfirmationDialog } from "@/app/confirmation-dialog";
import { UnitConverter } from "@/app/recipe/unit-converter";
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

interface NavigationApi {
  addEventListener(type: "navigate", listener: (event: Event) => void): void;
  removeEventListener(type: "navigate", listener: (event: Event) => void): void;
}

interface NavigationEventWithIntercept extends Event {
  canIntercept: boolean;
  navigationType: "push" | "reload" | "replace" | "traverse";
  hashChange: boolean;
  downloadRequest: string | null;
  intercept(options: { precommitHandler: () => Promise<void> }): void;
}

export interface RecipeFormDraftData {
  title: string;
  tags: string[];
  ingredients: Array<{
    quantity: number | null;
    unitId: string | null;
    ingredient: string;
  }>;
  steps: Array<{
    text: string;
  }>;
}

export interface RecipeFormInitialData extends RecipeFormDraftData {
  id: string;
  slug: string;
  hasPhoto: boolean;
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

type ReorderDirection = -1 | 1;

function moveRow<T extends { id: number }>(
  rows: T[],
  id: number,
  direction: ReorderDirection,
): T[] {
  const index = rows.findIndex((row) => row.id === id);
  const target = index + direction;

  if (index === -1 || target < 0 || target >= rows.length) {
    return rows;
  }

  const next = [...rows];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function dropRow<T extends { id: number }>(
  rows: T[],
  draggedId: number,
  targetId: number,
  position: "before" | "after",
): T[] {
  if (draggedId === targetId) {
    return rows;
  }

  const from = rows.findIndex((row) => row.id === draggedId);

  if (from === -1) {
    return rows;
  }

  const next = [...rows];
  const [item] = next.splice(from, 1);
  const targetIndex = next.findIndex((row) => row.id === targetId);

  if (targetIndex === -1) {
    return rows;
  }

  next.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, item);
  return next;
}

function DragHandle({
  onDragStart,
  onDragEnd,
}: {
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <span
      className="drag-handle"
      draggable
      aria-hidden="true"
      title="Drag to reorder"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      ⋮⋮
    </span>
  );
}

function ReorderButtons({
  itemLabel,
  index,
  count,
  onMove,
}: {
  itemLabel: string;
  index: number;
  count: number;
  onMove: (direction: ReorderDirection) => void;
}) {
  return (
    <div className="reorder-buttons">
      <button
        type="button"
        className="reorder-button"
        aria-label={`Move ${itemLabel} ${index + 1} up`}
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        ↑
      </button>
      <button
        type="button"
        className="reorder-button"
        aria-label={`Move ${itemLabel} ${index + 1} down`}
        disabled={index === count - 1}
        onClick={() => onMove(1)}
      >
        ↓
      </button>
    </div>
  );
}

export function RecipeForm({
  units,
  initialRecipe,
  draftRecipe,
}: {
  units: UnitOption[];
  initialRecipe?: RecipeFormInitialData;
  draftRecipe?: RecipeFormDraftData;
}) {
  const router = useRouter();
  const sourceRecipe = initialRecipe ?? draftRecipe;
  const initialIngredients = sourceRecipe?.ingredients.map(
    (ingredient, index) => ({
      id: index,
      quantity: ingredient.quantity === null ? "" : String(ingredient.quantity),
      unitId: ingredient.unitId ?? "",
      ingredient: ingredient.ingredient,
    }),
  ) ?? [emptyIngredient(0)];
  const initialSteps = sourceRecipe?.steps.map((step, index) => ({
    id: index,
    text: step.text,
  })) ?? [emptyStep(0)];
  const [ingredients, setIngredients] =
    useState<IngredientRow[]>(initialIngredients);
  const [steps, setSteps] = useState<StepRow[]>(initialSteps);
  const [title, setTitle] = useState(sourceRecipe?.title ?? "");
  const [tags, setTags] = useState(sourceRecipe?.tags.join(", ") ?? "");
  const initialPhotoStatus = initialRecipe?.hasPhoto ? "existing" : "none";
  const [photoStatus, setPhotoStatus] = useState<
    "none" | "existing" | "selected" | "removed"
  >(initialPhotoStatus);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [discardTarget, setDiscardTarget] = useState<string | null>(null);
  const [historyNavigationPending, setHistoryNavigationPending] =
    useState(false);
  const photoInput = useRef<HTMLInputElement | null>(null);
  const nextIngredientId = useRef(initialIngredients.length);
  const nextStepId = useRef(initialSteps.length);
  const allowNavigation = useRef(false);
  const historyDecision = useRef<((discardChanges: boolean) => void) | null>(
    null,
  );
  const [initialDraft] = useState(() =>
    JSON.stringify({
      title: initialRecipe?.title ?? "",
      tags: initialRecipe?.tags.join(", ") ?? "",
      photoStatus: initialPhotoStatus,
      ingredients: initialRecipe
        ? initialIngredients.map(({ quantity, unitId, ingredient }) => ({
            quantity,
            unitId,
            ingredient,
          }))
        : [emptyIngredient(0)].map(({ quantity, unitId, ingredient }) => ({
            quantity,
            unitId,
            ingredient,
          })),
      steps: initialRecipe
        ? initialSteps.map(({ text }) => ({ text }))
        : [emptyStep(0)].map(({ text }) => ({ text })),
    }),
  );
  const ingredientReferenceNames = useRef<Record<number, string>>(
    Object.fromEntries(
      initialIngredients.map((ingredient) => [
        ingredient.id,
        ingredient.ingredient,
      ]),
    ),
  );
  const stepTextareas = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const dragPayload = useRef<{
    kind: "ingredient" | "step";
    id: number;
  } | null>(null);
  const [dragInfo, setDragInfo] = useState<{
    kind: "ingredient" | "step";
    id: number;
    targetId: number | null;
    position: "before" | "after" | null;
  } | null>(null);
  const recipeAction = initialRecipe
    ? updateRecipeAction.bind(null, initialRecipe.id, initialRecipe.slug)
    : createRecipeAction;
  const [state, formAction, pending] = useActionState(recipeAction, {
    errors: [],
  });
  const currentDraft = JSON.stringify({
    title,
    tags,
    photoStatus,
    ingredients: ingredients.map(({ quantity, unitId, ingredient }) => ({
      quantity,
      unitId,
      ingredient,
    })),
    steps: steps.map(({ text }) => ({ text })),
  });
  const isDirty = currentDraft !== initialDraft;

  useEffect(
    () => () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    },
    [photoPreviewUrl],
  );

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (allowNavigation.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    function handleDocumentClick(event: MouseEvent) {
      if (
        allowNavigation.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const element =
        event.target instanceof Element
          ? event.target
          : event.target instanceof Node
            ? event.target.parentElement
            : null;
      const link = element?.closest<HTMLAnchorElement>("a[href]");

      if (!link || link.target === "_blank") {
        return;
      }

      const destination = new URL(link.href, window.location.href);

      if (destination.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setDiscardTarget(
        `${destination.pathname}${destination.search}${destination.hash}`,
      );
    }

    const navigation = (
      window as typeof window & {
        navigation?: NavigationApi;
      }
    ).navigation;

    function handleHistoryNavigation(rawEvent: Event) {
      const event = rawEvent as NavigationEventWithIntercept;

      if (
        allowNavigation.current ||
        historyDecision.current ||
        event.navigationType !== "traverse" ||
        !event.canIntercept ||
        !event.cancelable ||
        event.hashChange ||
        event.downloadRequest !== null
      ) {
        return;
      }

      event.intercept({
        precommitHandler: () =>
          new Promise<void>((resolve, reject) => {
            historyDecision.current = (discardChanges) => {
              historyDecision.current = null;
              setHistoryNavigationPending(false);

              if (discardChanges) {
                resolve();
              } else {
                reject(new DOMException("Navigation canceled.", "AbortError"));
              }
            };
            setHistoryNavigationPending(true);
          }),
      });
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    navigation?.addEventListener("navigate", handleHistoryNavigation);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
      navigation?.removeEventListener("navigate", handleHistoryNavigation);
      historyDecision.current?.(false);
    };
  }, [isDirty]);

  useEffect(() => {
    if (!pending) {
      allowNavigation.current = false;
    }
  }, [pending]);

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

  function clearDragState() {
    dragPayload.current = null;
    setDragInfo(null);
  }

  function handleReorderDragStart(kind: "ingredient" | "step", id: number) {
    return (event: DragEvent<HTMLElement>) => {
      dragPayload.current = { kind, id };
      event.dataTransfer.setData("text/plain", `${kind}:${id}`);
      event.dataTransfer.effectAllowed = "move";
      const row = event.currentTarget.closest(".ingredient-row, .step-rows li");

      if (row instanceof HTMLElement) {
        event.dataTransfer.setDragImage(row, 24, 24);
      }

      setDragInfo({ kind, id, targetId: null, position: null });
    };
  }

  function handleReorderDragOver(kind: "ingredient" | "step", targetId: number) {
    return (event: DragEvent<HTMLElement>) => {
      const payload = dragPayload.current;

      if (!payload || payload.kind !== kind || payload.id === targetId) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const rect = event.currentTarget.getBoundingClientRect();
      const position =
        event.clientY <= rect.top + rect.height / 2 ? "before" : "after";

      setDragInfo((current) =>
        current &&
        current.kind === kind &&
        current.id === payload.id &&
        current.targetId === targetId &&
        current.position === position
          ? current
          : { kind, id: payload.id, targetId, position },
      );
    };
  }

  function handleReorderDrop(kind: "ingredient" | "step", targetId: number) {
    return (event: DragEvent<HTMLElement>) => {
      const payload = dragPayload.current;

      if (!payload || payload.kind !== kind) {
        return;
      }

      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const position =
        event.clientY <= rect.top + rect.height / 2 ? "before" : "after";

      if (kind === "ingredient") {
        setIngredients((rows) => dropRow(rows, payload.id, targetId, position));
      } else {
        setSteps((rows) => dropRow(rows, payload.id, targetId, position));
      }

      clearDragState();
    };
  }

  function reorderIndicatorClass(
    kind: "ingredient" | "step",
    id: number,
  ): string {
    if (!dragInfo || dragInfo.kind !== kind) {
      return "";
    }

    if (dragInfo.targetId === id) {
      return dragInfo.position === "before" ? " drop-before" : " drop-after";
    }

    return dragInfo.id === id ? " is-dragging" : "";
  }

  const saveButton = (
    <button className="button" type="submit" disabled={pending}>
      {pending
        ? initialRecipe
          ? "Saving…"
          : "Creating…"
        : initialRecipe
          ? "Save changes"
          : "Create recipe"}
    </button>
  );

  return (
    <form
      action={formAction}
      className="recipe-form"
      onSubmit={() => {
        allowNavigation.current = true;
      }}
    >
      <div className="form-actions">{saveButton}</div>

      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          placeholder="Chicken Parmesan"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="form-field">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          type="text"
          maxLength={800}
          placeholder="Dinner, quick, chicken"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
        <p className="form-help">Separate tags with commas.</p>
      </div>

      <section className="form-section" aria-labelledby="photo-heading">
        <div className="section-heading">
          <div>
            <h2 id="photo-heading">Photo</h2>
            <p>Optional. Use a JPEG, PNG, or WebP image up to 4 MB.</p>
          </div>
        </div>

        {(photoStatus === "existing" ||
          (photoStatus === "selected" && photoPreviewUrl)) && (
          <div className="recipe-photo-editor">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                photoStatus === "selected"
                  ? (photoPreviewUrl ?? "")
                  : `/api/recipe/${initialRecipe?.id}/photo`
              }
              alt={`Preview for ${title.trim() || "this recipe"}`}
            />
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                if (photoInput.current) {
                  photoInput.current.value = "";
                }

                setPhotoPreviewUrl(null);
                setPhotoStatus(initialRecipe?.hasPhoto ? "removed" : "none");
              }}
            >
              Remove photo
            </button>
          </div>
        )}

        {photoStatus === "removed" && initialRecipe?.hasPhoto && (
          <div className="photo-removal-notice">
            <span>The current photo will be removed when you save.</span>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPhotoStatus("existing")}
            >
              Keep photo
            </button>
          </div>
        )}

        <div className="form-field">
          <label htmlFor="photo">
            {initialRecipe?.hasPhoto ? "Replace photo" : "Choose photo"}
          </label>
          <input
            ref={photoInput}
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (!file) {
                setPhotoPreviewUrl(null);
                setPhotoStatus(initialRecipe?.hasPhoto ? "existing" : "none");
                return;
              }

              setPhotoPreviewUrl(URL.createObjectURL(file));
              setPhotoStatus("selected");
            }}
          />
        </div>
        <input
          type="hidden"
          name="removePhoto"
          value={photoStatus === "removed" ? "true" : "false"}
        />
      </section>

      <section className="form-section" aria-labelledby="ingredients-heading">
        <div className="section-heading">
          <div>
            <h2 id="ingredients-heading">Ingredients</h2>
            <p>Quantity and unit are optional.</p>
          </div>
        </div>

        <div className="ingredient-header" aria-hidden="true">
          <span />
          <span>Qty</span>
          <span>Unit</span>
          <span>Ingredient</span>
          <span />
          <span />
        </div>

        <div className="ingredient-rows">
          {ingredients.map((row, index) => (
            <div
              className={`ingredient-row${reorderIndicatorClass("ingredient", row.id)}`}
              key={row.id}
              onDragOver={handleReorderDragOver("ingredient", row.id)}
              onDrop={handleReorderDrop("ingredient", row.id)}
            >
              <DragHandle
                onDragStart={handleReorderDragStart("ingredient", row.id)}
                onDragEnd={clearDragState}
              />
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

              <ReorderButtons
                itemLabel="ingredient"
                index={index}
                count={ingredients.length}
                onMove={(direction) =>
                  setIngredients((rows) => moveRow(rows, row.id, direction))
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

        <div className="section-footer">
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
      </section>

      <section className="form-section" aria-labelledby="steps-heading">
        <div className="section-heading">
          <div>
            <h2 id="steps-heading">Instructions</h2>
            <p>Keep each instruction in its own step. Markdown is supported.</p>
          </div>
        </div>

        <ol className="step-rows">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={reorderIndicatorClass("step", step.id) || undefined}
              onDragOver={handleReorderDragOver("step", step.id)}
              onDrop={handleReorderDrop("step", step.id)}
            >
              <DragHandle
                onDragStart={handleReorderDragStart("step", step.id)}
                onDragEnd={clearDragState}
              />
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
              <ReorderButtons
                itemLabel="instruction"
                index={index}
                count={steps.length}
                onMove={(direction) =>
                  setSteps((rows) => moveRow(rows, step.id, direction))
                }
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

        <div className="section-footer">
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
      </section>

      <section className="form-section" aria-labelledby="converter-heading">
        <div className="section-heading">
          <div>
            <h2 id="converter-heading">Unit converter</h2>
            <p>Use this as a reference while entering ingredient amounts.</p>
          </div>
        </div>
        <UnitConverter />
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
        {saveButton}
      </div>

      <ConfirmationDialog
        open={discardTarget !== null || historyNavigationPending}
        title="Discard your changes?"
        description="Your unsaved recipe changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        tone="danger"
        onCancel={() => {
          if (historyNavigationPending) {
            historyDecision.current?.(false);
            return;
          }

          setDiscardTarget(null);
        }}
        onConfirm={() => {
          if (historyNavigationPending) {
            historyDecision.current?.(true);
            return;
          }

          if (!discardTarget) {
            return;
          }

          allowNavigation.current = true;
          router.push(discardTarget);
        }}
      />
    </form>
  );
}
