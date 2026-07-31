import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";

import { ThemeToggle } from "./theme-toggle";

export const metadata: Metadata = {
  title: "Cookin",
  description: "A private personal recipe collection.",
  robots: {
    index: false,
    follow: false,
  },
};

const themeScript = `
  try {
    const theme = localStorage.getItem("cookin-theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    }

    const textSize = localStorage.getItem("cookin-text-size");
    if (textSize === "large") {
      document.documentElement.dataset.textSize = textSize;
    }
  } catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <nav className="site-controls" aria-label="Display controls">
          <Link href="/settings" className="settings-shortcut">
            Settings
          </Link>
          <ThemeToggle />
        </nav>
        {children}
      </body>
    </html>
  );
}
