import Link from "next/link";

import { RecipeForm } from "./recipe-form";
import { listUnits } from "@/lib/unit/list";

export default async function NewRecipePage() {
  const units = await listUnits();

  return (
    <main id="main-content" className="container form-page" tabIndex={-1}>
      <Link href="/" className="back-link">
        ← All recipes
      </Link>
      <RecipeForm
        units={units}
        heading="Create recipe"
        subheading="Add only what you need to cook it."
      />
    </main>
  );
}
