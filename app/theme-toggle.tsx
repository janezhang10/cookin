"use client";

type Theme = "light" | "dark";

function effectiveTheme(): Theme {
  const savedTheme = document.documentElement.dataset.theme;

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle light or dark mode"
      title="Toggle light or dark mode"
      onClick={() => {
        const nextTheme: Theme = effectiveTheme() === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = nextTheme;

        try {
          localStorage.setItem("cookin-theme", nextTheme);
        } catch {}

        window.dispatchEvent(new Event("cookin-settings-change"));
      }}
    >
      <span className="theme-icon-for-light" aria-hidden="true">
        {"\u2600"}
      </span>
      <span className="theme-icon-for-dark" aria-hidden="true">
        {"\u263e"}
      </span>
    </button>
  );
}
