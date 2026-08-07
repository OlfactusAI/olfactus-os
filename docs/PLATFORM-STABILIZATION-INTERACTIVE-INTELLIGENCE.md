# OLFACTUS v2.1.0-alpha.2 — Platform Stabilization & Interactive Intelligence

## Neural Simulator completion

- ordered multi-action scenarios
- add, remove, and replace actions
- action reordering and removal
- current-versus-simulated comparison table
- named browser-local saved scenarios
- saved scenario restoration and deletion
- full scenario application
- timeline event after applying a scenario

## Editable Timeline

- manually add events
- edit title, notes, type, and date
- delete incorrect events
- persistent ledger refresh after changes

## Collector Assistant evidence

Every generated insight now includes supporting evidence. The interface supports:

- why-this-appeared expansion
- mark helpful
- mark inaccurate
- remind later
- dismiss

Feedback is stored locally.

## Graph continuity

Selected and comparison nodes persist between Graph visits when the nodes remain
available in the current graph.

## Database scale testing

Synthetic benchmarks cover:

- 1,000 records
- 5,000 records
- 10,000 records
- 25,000 records
- 50,000 records

The benchmark measures generation, indexing, search, pagination, estimated
memory, and recommended shard count. Synthetic records are never exposed as
real fragrance data.

## Integration coverage

Tests now connect Collection Health, Assistant evidence, and Simulator outputs
in one workflow.
