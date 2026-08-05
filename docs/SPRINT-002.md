# Sprint 002 — Collection Management

## Permanent capability

Collectors can now manage a persistent collection inside the shared OLFACTUS application.

## Added

- Shared `CollectionProvider` mounted at the product-shell level.
- Browser persistence using a versioned local-storage key.
- Pure reducer for add, remove, update, favorite, wear logging, hydration, and reset actions.
- Search by fragrance, brand, or family.
- Family filtering and sorting by name, rating, wear count, or recency.
- Add-fragrance catalog containing intelligence-ready records.
- Dynamic collection statistics.
- Interactive fragrance cards with favorite, log-wear, and remove controls.
- Automatic Collection Health recalculation across Today and Collection.
- Reducer regression tests.

## Data flow

```text
Collection action
→ shared collection state
→ persisted browser state
→ Collection Health recalculation
→ Today briefing and Collection metrics update
```

## Current persistence boundary

The provider uses browser local storage during the pre-authentication alpha. The reducer and provider interface are intentionally isolated so the storage implementation can later be replaced by a server-backed repository without rewriting the UI or intelligence engine.
