"use client";

import { useEffect, useId, useRef } from "react";

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Keep editing",
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previouslyFocusedElement = document.activeElement;

    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      if (
        previouslyFocusedElement instanceof HTMLElement &&
        previouslyFocusedElement.isConnected
      ) {
        previouslyFocusedElement.focus();
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <section
        className="confirmation-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) {
            onCancel();
          }

          if (event.key === "Tab") {
            const buttons = [
              cancelButtonRef.current,
              confirmButtonRef.current,
            ].filter(
              (button): button is HTMLButtonElement =>
                button !== null && !button.disabled,
            );
            const firstButton = buttons[0];
            const lastButton = buttons.at(-1);

            if (!firstButton || !lastButton) {
              event.preventDefault();
              return;
            }

            if (event.shiftKey && document.activeElement === firstButton) {
              event.preventDefault();
              lastButton.focus();
            } else if (
              !event.shiftKey &&
              document.activeElement === lastButton
            ) {
              event.preventDefault();
              firstButton.focus();
            }
          }
        }}
      >
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="dialog-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="dialog-cancel-button"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={
              tone === "danger"
                ? "dialog-danger-button"
                : "button compact-button"
            }
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
