# OLFACTUS v2.0.0b-1 — Import Parser & Normalization

Engine foundation: `GDI-2.0.0`

## Supported formats

- JSON arrays
- JSON objects containing a `records` array
- CSV with quoted fields and escaped quotes

## Flexible column recognition

The parser recognizes common alternatives such as:

- `name`, `fragrance`, `perfume`
- `brand`, `house`, `manufacturer`
- `perfumer`, `nose`, `creator`
- `releaseYear`, `year`, `launched`
- `topNotes`, `heartNotes`, `baseNotes`
- `accords`, `mainAccords`

## Normalization

- canonical IDs
- whitespace and diacritics
- list fields
- release years
- 0–10 and 0–100 performance scores
- availability status
- aliases
- source references

## Diagnostics

Every import returns:

- rows received
- rows parsed
- rows rejected
- row-level errors
- warnings
- informational normalization events

## Compatibility

Normalized import records can be adapted into the existing
`FragranceRecord` domain so current OLFACTUS engines can consume imported
records before the full commit pipeline is introduced.

## Next phase

v2.0.0b-2 will add duplicate detection, record matching, field-level conflict
analysis, and merge recommendations.
