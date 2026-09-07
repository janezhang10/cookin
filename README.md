# Cookin

Recipes, but only the good stuff.

Cookin is a private recipe application designed for personal use. It focuses on
making recipes easy to read, edit, search, and follow while cooking.

## What Works

- Create, edit, and delete recipes
- Search by recipe title, ingredient, or multiple comma-separated ingredients
- Add tags and filter the recipe list by tag
- Import a structured plain-text or Markdown recipe and review it before saving
- Extract and import recipes from text-based PDF files
- Add, replace, or remove a photo for each recipe
- Favorite recipes and filter the collection to favorites
- Use a remembered light or dark color theme
- Choose a theme and comfortable text size in Settings
- Navigate by keyboard with accessible focus and reduced-motion support
- Markdown instructions
- Ingredient references with quantities inside instructions
- Divide ingredient quantities by 1, 2, 3, or 4
- Check off ingredients while cooking
- Follow one instruction at a time in cooking mode
- Run a timer while moving between cooking steps
- Convert common cooking weight and volume units
- Confirm before discarding edits or deleting a recipe
- Hosted recipe storage shared across devices
- Separate hosted photo storage
- Owner-only private access

## Run Locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The development command
applies pending migrations to a local Cloudflare database emulator before
starting Next.js.

The previous `dev.db` file is retained as a legacy backup, but the application
no longer reads or writes it.

## Documentation

See `docs/` for the project specification, architecture, schema, and roadmap.
The private deployment recommendation is in `docs/HOSTING.md`.

## Deploy
Run `npm run deploy`