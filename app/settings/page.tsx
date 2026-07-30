import Link from "next/link";

import { SettingsControls } from "./settings-controls";

export default function SettingsPage() {
  return (
    <main className="container form-page settings-page">
      <Link href="/" className="back-link">
        &larr; Recipes
      </Link>

      <header className="page-header">
        <h1>Settings</h1>
        <p>Adjust how Cookin looks on this device.</p>
      </header>

      <SettingsControls />
    </main>
  );
}
