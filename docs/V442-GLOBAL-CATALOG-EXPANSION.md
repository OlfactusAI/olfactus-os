# OLFACTUS OS v4.4.2-alpha.1 — Global Fragrance Catalog Expansion Foundation

This release creates the scalable ingestion and validation layer needed before
Collection Twin 2.0 can operate over a genuinely broad fragrance universe.

## Architecture

Catalog V2 is staged separately from the existing intelligence catalog.

Flow:

source
→ parse
→ normalize
→ validate
→ provenance
→ duplicate detection
→ review
→ commit

No imported record is silently activated into the intelligence catalog.

## Provenance

Every imported record carries:
- source kind
- source name
- source record ID
- import timestamp
- optional retrieval timestamp
- optional license
- optional source URL
- confidence

## Coverage

The first target registry covers designer, niche, and heritage/independent
houses. Coverage diagnostics identify which houses remain missing rather than
letting expansion drift toward the same few brands.

## Next

v4.4.2-alpha.2 should add source adapters and the first large validated import
batch. v4.4.3 then enriches those records with perfumers, notes, accords,
collections, companies, lineage, and graph relationships.
