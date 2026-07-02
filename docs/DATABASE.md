# Database Design

This document defines the logical data model for Cookin.

It is intentionally implementation-agnostic. The Prisma schema should be considered an implementation of this document rather than the source of truth.

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
│                    │
│                    └─────► Unit
│
├── RecipeStep
│      │
│      └── RecipeStepIngredientUsage
│                    │
│                    ├────► RecipeIngredient
│                    └────► Unit
│
├── RecipePhoto
│
├── RecipeTag ─────► Tag
│
└── RecipeCuisine ─► Cuisine


---

## Two design changes I'd like to make

After thinking through the importer and editor, there are two changes I'd make to our original plan.

### 1. Store Markdown with Placeholders

Instead of storing rendered ingredient text in each step, I'd store Markdown with placeholders that reference the ingredient usage.

For example:

```md
Heat {{usage:1}} over medium heat.
```

The renderer would replace `{{usage:1}}` with a styled ingredient chip like `½ tbsp butter`.

This keeps the markdown readable, lets us apply custom styling, and makes ingredient references interactive. Clicking a chip could highlight the ingredient in the shopping list, and vice versa.

### 2. Represent Quantities as Fractions

I'd also avoid floating-point numbers for ingredient quantities.

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

These two decisions will add a little complexity to the implementation, but I think they'll make the editor, renderer, and scaling logic much more robust in the long run.