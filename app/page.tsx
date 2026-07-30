import { listRecipes } from "@/lib/recipe/list";

import { RecipeBrowser } from "./recipe-browser";

export default async function HomePage() {
  const recipes = await listRecipes();

  return (
    <main id="main-content" className="container" tabIndex={-1}>
      <RecipeBrowser recipes={recipes} />
    </main>
  );
}
