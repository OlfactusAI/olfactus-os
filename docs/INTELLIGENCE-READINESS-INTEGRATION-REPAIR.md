# Intelligence Readiness Integration Repair

This package repairs the cascading failures in `2.0.0-alpha.10`.

- Collection Health now imports `filterCatalogForEngine`.
- Deal Lab resolves its candidate from `input.catalog` before creating
  `eligibleCatalog`.
- Brand deep links use `BrandIntelligenceProfile.name`.
- Perfumer deep links use `PerfumerIntelligenceProfile.name`.
- Lineage replaces 1 invalid `database.catalog` reference(s)
  with `database.fragrances`.

The Intelligence Readiness Gateway remains enabled.
