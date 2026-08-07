# OLFACTUS v2.0.0b-2 — Duplicate & Conflict Detection

Engine: `GDM-2.0.0`

## Match classifications

- new
- exact duplicate
- probable duplicate
- possible variant
- safe update
- conflicting update
- manual review

## Weighted matching

The engine evaluates:

- canonical ID
- fragrance name
- brand
- concentration
- release year
- perfumers
- notes
- accords
- aliases

## Field conflict analysis

Each matched record receives field-level comparisons for:

- name
- brand
- concentration
- release year
- family
- perfumers
- top, heart, and base notes
- accords
- availability

Each field is classified as:

- same
- incoming adds data
- existing record is more complete
- conflict

## Recommended actions

- create
- skip
- merge
- update
- review

## Batch reporting

The engine summarizes counts for every classification and returns the top
match candidates for every incoming record.

## Next phase

v2.0.0b-3 will add the Preview & Commit Pipeline, allowing records to be
approved, rejected, merged, or updated before any changes are committed.
