# OLFACTUS OS v4.4.6-alpha.4 — Reference Intelligence Laboratory: Evidence Ledger + Reviewer Workflow

Milestone 3 of the Reference Intelligence Laboratory.

## Added

- `/reference-lab/review`
- immutable review packages derived from submitted calibration workspaces
- claim-by-claim evidence ledger
- reviewer attribution
- approve / request revision / reject decisions
- mandatory notes for revision and rejection
- self-review prevention
- package-level review state
- review progress summaries
- local review persistence
- submission-to-review integration

## Audit principle

Reviewer decisions are additive records. They do not overwrite the original
calibration claim, score, confidence, rationale, or evidence.

## Still excluded

- reviewer consensus calculation
- variance calculation
- automated conflict detection
- Gold Standard certification
- NRE promotion

Those remain separate milestones.
