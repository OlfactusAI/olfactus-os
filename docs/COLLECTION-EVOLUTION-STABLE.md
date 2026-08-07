# OLFACTUS OS v1.7.0 — Collection Evolution Stable

This release consolidates:

- CEE-1.0.0 Evolution Engine
- Interactive Collection Replay
- EAR-1.0.0 Taste Evolution and Annual Review
- Timeline, Genome, Market, and Analyst integration
- explicit capture reasons
- duplicate-snapshot prevention
- snapshot migration and retention rules
- deterministic Annual Review timeline events

## Snapshot behavior

- `tracking-started`: first baseline
- `collection-changed`: owned fragrance set changed
- `wear-milestone`: five or more wears accumulated
- `manual-capture`: user requested a snapshot
- `purchase-impact`: purchase-specific impact snapshot
- `annual-review`: protected annual checkpoint
- `imported-history`: reconstructed historical baseline

## Retention

The evolution ledger retains up to 500 snapshots. Baseline, manual, purchase,
and annual-review snapshots are prioritized. Identical automatic snapshots
within six hours are collapsed.

## Storage

`olfactus.evolution.ledger.v1`
