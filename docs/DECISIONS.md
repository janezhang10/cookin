# Architecture Decisions

## ADR-0001

Date: YYYY-MM-DD

Decision

Cookin is a private-first application.

Reason

The application is designed for personal use and does not require public hosting.

---

## ADR-0002

Date: YYYY-MM-DD

Decision

Recipes separate ingredient totals from ingredient usage.

Reason

Ingredient shopping lists and cooking instructions represent different concepts and should be modeled independently.

---

## ADR-0003

Decision

Ingredients are normalized into their own table.

Reason

Allows aliases, structured searching, future nutrition data, and prevents duplicate ingredient names.

---

## ADR-0004

Decision

Measurement units are normalized.

Reason

Supports serving scaling, validation, and consistent display formatting.