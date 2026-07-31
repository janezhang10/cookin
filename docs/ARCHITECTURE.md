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

- Cloudflare D1 (SQLite semantics)
- Drizzle ORM

File storage

- Cloudflare R2 for recipe photos

Authentication and access

- Owner-only access is enforced by the hosting platform.
- The application does not maintain a separate password database.

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
- `lib/db/` — request-scoped D1 client
- `lib/storage/` — recipe photo storage
- `db/` and `drizzle/` — hosted database schema and migrations
- `prisma/` — legacy local database migration history
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
- Tag
- RecipeTag

Recipe photo metadata is stored with the recipe. The image bytes are stored in
R2.

Relationships will be documented as the schema evolves.
