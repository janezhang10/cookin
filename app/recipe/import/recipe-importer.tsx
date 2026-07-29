"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/app/confirmation-dialog";
import {
  RecipeForm,
  type RecipeFormDraftData,
} from "@/app/recipe/new/recipe-form";
import {
  parsePlainTextRecipe,
  type ImportUnitOption,
} from "@/lib/recipe/importPlainText";

const exampleRecipe = `# Chicken Soup
**Tags:** dinner, soup

## Ingredients
- 1 lb chicken
- 2 cups broth
- 1/2 tsp salt

## Instructions
1. Brown the chicken.
2. Add the broth and simmer for 20 minutes.
3. Season with salt.`;

export function RecipeImporter({ units }: { units: ImportUnitOption[] }) {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<RecipeFormDraftData | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [parseVersion, setParseVersion] = useState(0);
  const [confirmReturnToText, setConfirmReturnToText] = useState(false);

  if (draft) {
    return (
      <div className="import-review">
        <div className="import-review-heading">
          <div>
            <h2>Review imported recipe</h2>
            <p>Nothing is saved until you select Create recipe.</p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setConfirmReturnToText(true)}
          >
            Edit pasted text
          </button>
        </div>

        {messages.length > 0 && (
          <div className="import-warnings" role="status">
            <p>Please double-check:</p>
            <ul>
              {messages.map((message, index) => (
                <li key={`${message}-${index}`}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <RecipeForm key={parseVersion} units={units} draftRecipe={draft} />

        <ConfirmationDialog
          open={confirmReturnToText}
          title="Return to pasted text?"
          description="Any changes made in the review editor will be lost. Your original pasted text will still be available."
          confirmLabel="Return to text"
          cancelLabel="Keep reviewing"
          tone="danger"
          onCancel={() => setConfirmReturnToText(false)}
          onConfirm={() => {
            setConfirmReturnToText(false);
            setDraft(null);
            setMessages([]);
          }}
        />
      </div>
    );
  }

  function parseRecipe() {
    const result = parsePlainTextRecipe(text, units);

    if (!result.success) {
      setMessages(result.errors);
      return;
    }

    setMessages(result.warnings);
    setDraft(result.draft);
    setParseVersion((version) => version + 1);
  }

  return (
    <section className="import-panel">
      <div className="form-field">
        <label htmlFor="recipe-text">Recipe text</label>
        <textarea
          id="recipe-text"
          className="import-textarea"
          rows={18}
          value={text}
          placeholder={exampleRecipe}
          autoFocus
          onChange={(event) => {
            setText(event.target.value);
            setMessages([]);
          }}
        />
        <p className="form-help">
          Markdown is optional. Use Ingredients and Instructions headings; one
          ingredient or step per line works best.
        </p>
      </div>

      {messages.length > 0 && (
        <div className="form-errors" role="alert">
          <p>Please fix the following:</p>
          <ul>
            {messages.map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="import-example">
        <summary>Show Markdown example</summary>
        <pre>{exampleRecipe}</pre>
      </details>

      <div className="import-actions">
        <button
          type="button"
          className="button"
          disabled={!text.trim()}
          onClick={parseRecipe}
        >
          Review recipe
        </button>
      </div>
    </section>
  );
}
