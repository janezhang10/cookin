# Cookin

Recipes, but only the good stuff.

Cookin is a private recipe application designed for personal use. It focuses on
making recipes easy to read, edit, search, and follow while cooking.

## What Works

- Create, edit, and delete recipes
- Search by recipe title, ingredient, or multiple comma-separated ingredients
- Markdown instructions
- Ingredient references with quantities inside instructions
- Divide ingredient quantities by 1, 2, 3, or 4
- Check off ingredients while cooking
- Follow one instruction at a time in cooking mode
- Convert common cooking weight and volume units
- Confirm before discarding edits or deleting a recipe
- Local SQLite storage

## Run Locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Recipe data is saved in
the local `dev.db` file.

## Documentation

See `docs/` for the project specification, architecture, schema, and roadmap.
