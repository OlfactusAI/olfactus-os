# OLFACTUS OS v4.4.5-alpha.1 — Catalog Activation Bridge Foundation

This milestone creates the controlled bridge from Catalog V2 into the active
OLFACTUS intelligence catalog.

## Activation levels

- `identity`
- `discovery`
- `intelligence`
- `full`

Catalog V2 data is no longer treated as all-or-nothing.

## Trust boundary

Identity and discovery records do **not** become recommendation-ready
`FragranceRecord`s automatically.

To enter the `intelligence` tier, a record must have an explicit intelligence
profile containing:

- roles
- seasonal suitability
- DNA dimensions
- moods
- performance

This prevents OLFACTUS from inventing neutral/default intelligence merely to
make incomplete imported records compatible with NRE.

## Runtime integration

Intelligence-eligible Catalog V2 activations can be persisted into the
Catalog V2 activation store. `getActiveFragranceCatalog()` now merges:

1. bundled catalog
2. legacy imported catalog
3. intelligence-eligible Catalog V2 activations

The merge is idempotent by fragrance ID.

## Event integration

Successful activation publishes `catalog.record.activated` through the Shared
Event Bus with the resolved activation level.

## Next

The next catalog milestone is the first genuinely sourced expansion batch.
Records can now enter identity/discovery tiers immediately while richer
intelligence enrichment can happen separately and safely.
