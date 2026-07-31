import "./globals.css";

import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { ThemeToggle } from "./theme-toggle";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const previewImage = new URL("/og.png", `${protocol}://${host}`);

  return {
    title: "Cookin",
    description: "A private personal recipe collection.",
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: "Cookin",
      description: "Recipes, but only the good stuff.",
      images: [previewImage],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cookin",
      description: "Recipes, but only the good stuff.",
      images: [previewImage],
    },
  };
}

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
