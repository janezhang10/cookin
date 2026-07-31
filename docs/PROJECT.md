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

Currently available:

- Browse, create, edit, and delete recipes
- Search by recipe title, ingredient, or multiple comma-separated ingredients
- Recipe tags and one-click tag filtering
- Ingredient-aware recipe editor
- Markdown-enabled instructions
- Scaled ingredient quantities
- Temporary ingredient checkboxes while cooking
- Focused, step-by-step cooking mode
- Pauseable cooking timer
- Cooking unit converter with approximate ingredient-density presets
- Unsaved-change protection and styled destructive confirmations
- Plain-text and Markdown recipe import with an editable review before saving
- Local text extraction and import from text-based PDF files
- One optional locally stored photo per recipe
- Persistent recipe favorites and favorites filtering
- Device-aware dark mode with a remembered local preference
- Device-local theme and text-size settings
- Keyboard navigation, focus-managed dialogs, reduced-motion support, and
  accessible contrast

Planned:

- Private authenticated online hosting

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

The initial deployment will use Tailscale Serve and its private `.ts.net` HTTPS
address. Tailscale identity will gate access before traffic reaches the
application, so a shared application password and custom domain are not needed.
The first deployment will retain SQLite and database-backed photos to avoid an
unnecessary data migration.

The hosted application must remain private while being available from personal
devices. The application will listen only on localhost and will be reachable
through Tailscale Serve, not Tailscale Funnel. Hosting work includes private
HTTPS, authorization on every page and mutation, automated SQLite backups,
restore testing, and deployment documentation. A managed database, object
storage, and application-level sign-in remain fallback options if Cookin later
moves to a public cloud host.

---

## Non-Goals

Cookin is not intended to be:

- A social network
- A blogging platform
- A public recipe sharing website
- A CMS

## Additional Features

### 1

Clicking ingredient makes all other references in instructions subtly glow
