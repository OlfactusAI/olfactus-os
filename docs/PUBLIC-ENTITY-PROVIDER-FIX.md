# Public Entity Provider Fix

The routes below live outside the `(app)` route group:

- `/fragrance/[slug]`
- `/entity/[type]/[identifier]`

The `(app)` layout supplies `ActiveCatalogProvider`, but public routes do not
inherit that layout. Both route families called `useActiveFragranceCatalog()`
without a provider and therefore threw a runtime error.

This repair adds route-level layouts around both public route families. Each
layout supplies `ActiveCatalogProvider`, allowing the active bundled and
imported fragrance catalog to resolve correctly.
