import Link from "next/link";

import { listUnits } from "@/lib/unit/list";

import { RecipeImporter } from "./recipe-importer";

export default async function ImportRecipePage() {
  const units = await listUnits();

  return (
    <main className="container form-page">
      <Link href="/" className="back-link">
        ← All recipes
      </Link>
      <header className="page-header">
        <h1>Import recipe</h1>
        <p>Paste a recipe, review what was found, then save it.</p>
      </header>
      <RecipeImporter units={units} />
    </main>
  );
}
