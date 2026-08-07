# OLFACTUS v2.0.0b-3 — Preview & Commit Pipeline

Engine: `GDI-2.0.0`

## Staged sessions

Each import becomes an isolated session with:

- source format
- source label
- staged records
- match results
- per-record decisions
- conflict resolutions
- preview totals
- draft, ready, committed, cancelled, or failed status

## Decisions

Each record can be:

- created
- skipped
- merged
- updated
- rejected
- held for review

## Conflict resolution

Conflicting fields can be resolved with:

- keep existing
- use incoming
- merge values

Unresolved conflicting updates cannot be committed.

## Commit behavior

The pipeline:

- operates on a copied catalog
- applies decisions record by record
- prevents accidental duplicate creation
- generates operation-level reports
- reports created, updated, merged, skipped, rejected, and failed totals
- leaves the original catalog unchanged until commit succeeds

## Next phase

v2.0.0b-4 will add the Import Workspace and visual reports, allowing users to
upload JSON or CSV files, inspect staged rows, resolve conflicts, and commit
approved records through the OLFACTUS interface.
