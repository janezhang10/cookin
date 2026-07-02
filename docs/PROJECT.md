# Project Specification

## Vision

Cookin is a personal recipe management application designed around the cooking experience rather than content publishing.

The goal is to create a fast, modern, private application that stores recipes as structured data while remaining pleasant to use on desktop, tablet, and mobile devices.

---

## Design Principles

- Private by default.
- No advertisements.
- No unnecessary clutter.
- Fast navigation.
- Mobile-friendly.
- Keyboard-friendly.
- Recipes should require minimal scrolling while cooking.
- Every piece of recipe information should have a single source of truth.

---

## Target Users

Initially:

- Me

Future possibilities:

- Family
- Trusted friends

The application is intentionally **not** being designed as a public recipe website.

---

## Core Features

- Browse recipes
- Search by title
- Search by ingredients
- Ingredient-aware recipe editor
- Markdown-enabled instructions
- Recipe photos
- Favorites
- Tags
- Serving scaling
- Cooking mode
- Import existing recipes

---

## Recipe Philosophy

Recipes consist of structured information rather than free-form documents.

A recipe contains:

- Metadata
- Ingredients
- Steps
- Ingredient usage
- Tags
- Photos

Ingredient totals and ingredient usage are separate concepts.

Example:

Shopping list:

1 tbsp butter

Step 1:

Use 1/2 tbsp butter

Step 2:

Use remaining 1/2 tbsp butter

This allows accurate instructions while maintaining a clean ingredient list.

---

## Search Philosophy

Search should operate on structured data whenever possible.

Users should eventually be able to search by:

- Title
- Ingredient
- Multiple ingredients
- Cuisine
- Tags
- Difficulty
- Cook time
- Favorites

---

## Hosting

Primary deployment target:

Home server connected through Tailscale.

Future deployment should require minimal configuration changes.

---

## Non-Goals

Cookin is not intended to be:

- A social network
- A blogging platform
- A public recipe sharing website
- A CMS