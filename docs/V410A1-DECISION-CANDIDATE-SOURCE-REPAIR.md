# OLFACTUS v4.1.0-alpha.1 — Decision Candidate Source Repair

Decision Lab previously sourced candidate fragrances from
`useCollection().available`. That collection-oriented helper is not the
authoritative global fragrance universe and could be empty even when the
active intelligence catalog contained many unowned fragrances.

Candidate sourcing now follows the v4 architecture:

1. `api.getCatalogContext()` provides the active fragrance universe.
2. `api.getCollectorState().ownership` provides canonical owned IDs.
3. Decision candidates are `catalog - ownedIds`.

The page also distinguishes four conditions:

- intelligence catalog unavailable
- every catalog fragrance truly owned
- no eligible candidate after filtering
- candidate exists but analysis failed

This prevents an empty provider result from being mislabeled as total
catalog ownership.
