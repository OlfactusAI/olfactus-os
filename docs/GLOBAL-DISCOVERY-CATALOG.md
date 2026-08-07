# OLFACTUS v4.1 — Global Discovery Catalog

The previous bundled catalog was an 8-fragrance core fixture that happened to
match the current demo collection. This made Decision Lab correctly—but
misleadingly—report that every catalog fragrance was already owned.

This repair introduces a separate curated Global Discovery Catalog containing
real fragrance entities across designer and niche houses. It is deliberately
marked `calibration`: names/brands/products are real, while quantitative
OLFACTUS DNA, season, role, and performance values remain intelligence
estimates until richer verified/imported data is available.

The active catalog is now:

core bundled records
+ curated Global Discovery Catalog
+ imported catalog records

Synthetic scale-benchmark records are never exposed as user-facing fragrances.

The same expanded universe now feeds:
- ActiveCatalogProvider
- active catalog repository helpers
- Global Database repository
- Unified Intelligence API consumers
- Decision Lab candidates
