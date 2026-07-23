import Link from "next/link";

import { RecipeForm } from "./recipe-form";
import { listUnits } from "@/lib/unit/list";

export default async function NewRecipePage() {
  const units = await listUnits();

  return (
    <main className="container form-page">
      <Link href="/" className="back-link">
        ← All recipes
      </Link>
      <header className="page-header">
        <h1>Create recipe</h1>
        <p>Add only what you need to cook it.</p>
      </header>
      <RecipeForm units={units} />
    </main>
  );
}
