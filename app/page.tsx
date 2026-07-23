import { listRecipes } from "@/lib/recipe/list";

import { RecipeBrowser } from "./recipe-browser";

export default async function HomePage() {
  const recipes = await listRecipes();

  return (
    <main className="container">
      <RecipeBrowser recipes={recipes} />
    </main>
  );
}
