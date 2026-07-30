"use client";

import { useSyncExternalStore } from "react";

type ThemePreference = "system" | "light" | "dark";
type TextSizePreference = "standard" | "large";

const settingsEvent = "cookin-settings-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(settingsEvent, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(settingsEvent, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getThemePreference(): ThemePreference {
  try {
    const savedTheme = localStorage.getItem("cookin-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {}

  return "system";
}

function getTextSizePreference(): TextSizePreference {
  try {
    return localStorage.getItem("cookin-text-size") === "large"
      ? "large"
      : "standard";
  } catch {
    return "standard";
  }
}

function setThemePreference(theme: ThemePreference) {
  if (theme === "system") {
    delete document.documentElement.dataset.theme;

    try {
      localStorage.removeItem("cookin-theme");
    } catch {}
  } else {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem("cookin-theme", theme);
    } catch {}
  }

  window.dispatchEvent(new Event(settingsEvent));
}

function setTextSizePreference(textSize: TextSizePreference) {
  if (textSize === "standard") {
    delete document.documentElement.dataset.textSize;

    try {
      localStorage.removeItem("cookin-text-size");
    } catch {}
  } else {
    document.documentElement.dataset.textSize = textSize;

    try {
      localStorage.setItem("cookin-text-size", textSize);
    } catch {}
  }

  window.dispatchEvent(new Event(settingsEvent));
}

export function SettingsControls() {
  const theme = useSyncExternalStore(
    subscribe,
    getThemePreference,
    () => "system",
  );
  const textSize = useSyncExternalStore(
    subscribe,
    getTextSizePreference,
    () => "standard",
  );

  return (
    <div className="settings-sections">
      <section className="settings-section" aria-labelledby="theme-heading">
        <div className="settings-section-heading">
          <div>
            <h2 id="theme-heading">Color theme</h2>
            <p>Follow this device or choose a theme yourself.</p>
          </div>
        </div>

        <div className="settings-options" role="group" aria-label="Color theme">
          {(
            [
              ["system", "Device", "Follow your device setting"],
              ["light", "Light", "Always use the light theme"],
              ["dark", "Dark", "Always use the dark theme"],
            ] as const
          ).map(([value, label, description]) => (
            <button
              key={value}
              type="button"
              className="settings-option"
              aria-pressed={theme === value}
              onClick={() => setThemePreference(value)}
            >
              <span>{label}</span>
              <small>{description}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section" aria-labelledby="text-size-heading">
        <div className="settings-section-heading">
          <div>
            <h2 id="text-size-heading">Text size</h2>
            <p>Make recipes and controls easier to read.</p>
          </div>
        </div>

        <div className="settings-options" role="group" aria-label="Text size">
          {(
            [
              ["standard", "Standard", "Use the regular text size"],
              ["large", "Large", "Increase text throughout Cookin"],
            ] as const
          ).map(([value, label, description]) => (
            <button
              key={value}
              type="button"
              className="settings-option"
              aria-pressed={textSize === value}
              onClick={() => setTextSizePreference(value)}
            >
              <span>{label}</span>
              <small>{description}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="settings-footer">
        <p>These preferences are saved only on this device.</p>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setThemePreference("system");
            setTextSizePreference("standard");
          }}
        >
          Restore defaults
        </button>
      </div>
    </div>
  );
}
