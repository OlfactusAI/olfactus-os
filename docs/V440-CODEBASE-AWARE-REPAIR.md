# OLFACTUS OS v4.4.0-alpha.1 — Codebase-Aware Repair

This repair removes the type assumptions exposed by the production build.

- NRE no longer assumes `market.typicalPrice`.
- NRE no longer assumes `airy`, `warm`, `unique`, or `unusual` are members of
  the canonical `DnaDimension` type.
- Market and DNA access now use conservative schema adapters.
- `getNeuralRecommendationsV2()` reuses the existing `getCollectorState()` and
  `getCatalogContext()` Intelligence API contracts.
- Global Analyst narrows `AnalystResponse` explicitly and treats `preview` as an
  optional unified-result property.
- The manifest test now targets v4.4.0-alpha.1.
