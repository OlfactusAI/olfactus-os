# OLFACTUS OS v4.4.6-alpha.2 — Reference Intelligence Laboratory: Data Model

Milestone 1 of the Reference Intelligence Laboratory.

## Added

- calibration sessions
- calibration versions
- immutable-version lock semantics
- reviewer identities
- evidence ledger records
- reviewer submissions
- consensus snapshot contracts
- calibration conflict contracts
- Gold Standard certificate contracts
- session-scoped laboratory snapshots
- in-memory repository contract for development/testing

## Not added yet

- Calibration Workspace UI
- consensus calculation
- conflict-detection engine
- Gold Standard promotion engine
- first 25 calibrated reference profiles

Those remain separate milestones so each layer can be tested and committed
independently.

## Integrity rule

Locked calibration versions cannot receive new claims. Changes to a locked
version must occur in a new calibration version rather than mutating the
historical record.
