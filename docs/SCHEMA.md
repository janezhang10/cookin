# Schema

This document defines the canonical data model for Cookin.

It describes the domain model independently of any implementation details (Prisma, SQLite, PostgreSQL, etc.). The Prisma schema should be considered an implementation of this document.

---

# Design Principles

## Structured Data

Recipes are stored as structured data instead of free-form documents.

This enables:

- Rich searching
- Validation
- Ingredient highlighting
- Recipe scaling
- Recipe importing
- Future automation

---

## Single Source of Truth

User-entered information should only exist once.

Examples:

- Ingredients exist once per recipe.
- Ingredient usage references ingredients rather than duplicating them.
- Units are normalized.
- Canonical ingredients are shared across recipes.

---

## Model the Domain

Database entities represent real concepts in cooking rather than UI elements.

Examples:

- Ingredient
- Recipe Ingredient
- Ingredient Usage
- Equipment
- Unit

---

# Domain Overview

Recipe
│
├── RecipeIngredient
│      │
│      ├── Ingredient
│      └── Unit
│
├── RecipeStep
│      │
│      └── RecipeStepIngredientUsage
│
├── RecipeEquipment
│
├── RecipePhoto
│
├── RecipeTag
│
└── RecipeCuisine

---

# Domain Entities

## Recipe

Represents a recipe.

Fields

- id
- title
- slug
- description
- yieldQuantity
- yieldUnit
- prepMinutes
- cookMinutes
- restMinutes
- notes
- source
- difficultyId
- cuisineId
- status
- createdAt
- updatedAt

Relationships

- has many RecipeIngredients
- has many RecipeSteps
- has many RecipePhotos
- has many RecipeTags
- has many RecipeEquipment

---

## Ingredient

Canonical ingredient shared between recipes.

Examples

- Butter
- Garlic
- Chicken Breast
- Soy Sauce

Fields

- id
- canonicalName
- defaultUnitId
- categoryId
- notes

Relationships

- has many IngredientAliases
- referenced by RecipeIngredients

---

## IngredientAlias

Alternative names for a canonical ingredient.

Examples

Green Onion

Aliases

- Scallion
- Spring Onion

Fields

- id
- ingredientId
- alias

---

## RecipeIngredient

Represents an ingredient inside a specific recipe.

Fields

- id
- recipeId
- ingredientId
- quantity
- unitId
- displayName
- modifier
- optional
- displayOrder

Examples

Shopping List

1 tbsp softened butter

2 boneless skinless chicken breasts

Relationships

- belongs to Recipe
- references Ingredient
- references Unit
- referenced by RecipeStepIngredientUsage

---

## RecipeStep

Represents a single instruction.

Fields

- id
- recipeId
- stepNumber
- markdown

Relationships

- belongs to Recipe
- has many IngredientUsages

---

## RecipeStepIngredientUsage

Represents the amount of a recipe ingredient used during a step.

Fields

- id
- recipeStepId
- recipeIngredientId
- quantity
- displayOrder
- displayText (optional)

Examples

Shopping List

1 tbsp butter

Step 1

½ tbsp butter

Step 2

remaining butter

Relationships

- belongs to RecipeStep
- references RecipeIngredient

---

## RecipePhoto

Represents an image associated with a recipe.

Fields

- id
- recipeId
- filename
- caption
- displayOrder

---

## Equipment

Represents kitchen equipment.

Examples

- Dutch Oven
- Stand Mixer
- Baking Sheet
- Cast Iron Skillet

Fields

- id
- name

---

## RecipeEquipment

Equipment used by a recipe.

Fields

- recipeId
- equipmentId
- optional

---

# Lookup Entities

## Unit

Examples

- tsp
- tbsp
- cup
- gram
- kilogram
- ounce
- pound
- clove
- pinch
- piece

---

## Cuisine

Examples

- Italian
- Chinese
- Japanese
- Mexican

---

## Difficulty

Examples

- Easy
- Intermediate
- Advanced

---

## Tag

Examples

- Dinner
- Dessert
- Vegetarian
- Pasta
- Air Fryer

---

## IngredientCategory

Examples

- Produce
- Dairy
- Meat
- Seafood
- Baking
- Pantry
- Spices

---

# Editor Model

Recipe editing follows this workflow.

Recipe

↓

Ingredients

↓

Steps

↓

Ingredient References

Ingredient references are selected from the recipe's ingredient list.

Users never manually type ingredient placeholders.

The editor is responsible for inserting and maintaining placeholder tokens within the underlying Markdown representation.

---

# Rendering Model

Markdown

↓

Token Parser

↓

React Components

↓

Rendered Recipe

Ingredient references become interactive React components.

This enables:

- Hover effects
- Clickable ingredient chips
- Ingredient highlighting
- Future tooltips
- Validation

---

# Validation Rules

## Ingredient Usage

Ingredient usage should not exceed the amount defined by the corresponding RecipeIngredient.

The editor should warn when totals differ.

Example

Shopping List

1 tbsp butter

Instruction Usage

½ tbsp

½ tbsp

✓ Valid

Instruction Usage

½ tbsp

¾ tbsp

⚠ Warning

---

## Ordering

Recipe ingredients maintain display order.

Recipe steps maintain display order.

Ingredient usages maintain display order within each step.

---

# Future Expansion

The current schema intentionally leaves room for future features including:

- Pantry inventory
- Shopping lists
- Nutrition information
- Meal planning
- Collections
- Multiple users
- Recipe sharing
- Version history