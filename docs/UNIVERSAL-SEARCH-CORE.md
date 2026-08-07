# OLFACTUS v2.0.0c-1 — Universal Search Core

Engine: `USE-2.0.0`

## Indexed entities

- fragrances
- brands
- perfumers
- notes
- accords
- ingredients
- fragrance lines

## Search behavior

- exact matches
- prefix matches
- partial matches
- aliases
- metadata keywords
- typo tolerance
- punctuation and diacritic normalization
- entity weighting
- quality weighting
- popularity weighting
- grouped results
- match explanations

## Imported data

The search index can combine the bundled catalog with browser-persisted
imported fragrances. Imported records retain their source label in search
results.

## Shared catalog helper

`getActiveFragranceCatalog()` merges bundled and imported records so later
modules can activate imported data without duplicating merge logic.

## Next phase

v2.0.0c-2 will add the visible Global Search Interface, including a top-level
search control, Command-K shortcut, instant suggestions, recent searches,
keyboard navigation, and direct routing.
