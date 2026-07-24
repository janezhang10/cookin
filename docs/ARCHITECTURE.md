# Architecture

## Technology Stack

Frontend

- Next.js
- React
- TypeScript
- Plain CSS

Backend

- React Server Components
- Next.js Server Actions

Database

- SQLite
- Prisma ORM

Authentication

None initially.

Access is controlled through Tailscale.

---

## Design Goals

- Strong typing
- Modular architecture
- Minimal dependencies
- Clean separation of concerns
- Testable business logic
- Database portability

---

## Folder Structure

- `app/` — pages, interactive components, and generated Prisma client
- `lib/recipe/` — recipe queries, mutations, scaling, and slugs
- `lib/markdown/` — Markdown rendering and ingredient-reference tokens
- `lib/validation/` — recipe form validation
- `lib/db/` — Prisma client
- `prisma/` — schema and seed data
- `docs/` — product and technical documentation

---

## Data Model

Major entities include:

- Recipe
- Ingredient
- Unit
- RecipeIngredient
- RecipeStep
- RecipeStepIngredientUsage
  Tags and photos remain planned features and are not yet in the Prisma schema.

Relationships will be documented as the schema evolves.
