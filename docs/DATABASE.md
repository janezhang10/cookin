# Database Design

This document defines the logical data model for Cookin.

It is intentionally implementation-agnostic. The Prisma schema should be considered an implementation of this document rather than the source of truth.

## Current Implementation

The local application uses SQLite through Prisma. Its database is stored in
`dev.db`; there is no hosted database.

Recipe instructions are stored as Markdown. Ingredient references use readable
tokens such as `[[Butter]]`, and related usage records are generated when a
recipe is saved. Quantities are currently stored as floating-point values.
Exact numerator/denominator storage remains a possible future migration.

## Design Principles

- Normalize data where practical.
- Store structured data instead of parsing text.
- Avoid duplication whenever possible.
- Every entity should represent a real-world concept.
- Prefer explicit relationships over JSON blobs.
- Optimize for maintainability over premature optimization.

---

# Entity Overview

Recipe
│
├── RecipeIngredient ──────► Ingredient
│ │
│ └─────► Unit
│
├── RecipeStep
│ │
│ └── RecipeStepIngredientUsage
│ │
│ ├────► RecipeIngredient
│ └────► Unit
│
├── RecipePhoto
│
├── RecipeTag ─────► Tag
│
└── RecipeCuisine ─► Cuisine

---

## Future Data Model Improvements

After thinking through the importer and editor, there are two changes I'd make to our original plan.

### 1. Stable Ingredient Reference IDs

The current readable name tokens work well for editing, but stable ID-based
placeholders may eventually make references more resilient.

One possible representation:

```md
Heat {{usage:1}} over medium heat.
```

The renderer would replace `{{usage:1}}` with a styled ingredient chip like `½ tbsp butter`.

The renderer could replace these placeholders with interactive ingredient
chips. A migration would be needed before changing the current token format.

### 2. Represent Quantities as Fractions

The current schema uses floating-point numbers. A future version may store
quantities as fractions instead.

Instead of storing `0.333333`, we'd store:

```text
numerator
denominator
```

Examples:

- 1/2
- 3/4
- 2 1/2 (stored as `5/2`)
- 1/3

Cooking naturally uses fractions, and this approach avoids rounding issues while making serving scaling exact. We can always convert to decimal internally if needed, but the stored data remains precise.

This would make common cooking fractions and scaling exact, at the cost of a
schema migration and slightly more quantity-handling code.
