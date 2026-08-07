# OLFACTUS OS v4.5.0-alpha.4 — Dataset Consensus + Certification Orchestrator

This milestone connects the Gold Standard Dataset Builder's approved review
packages to the existing Reference Laboratory and production-governance stack.

## Route

`/gold-standard-builder/orchestrate`

## Stage 1 — Consensus

Consensus can only be generated when both independent review packages are fully
approved.

The generated run is persisted to the shared Reference Laboratory consensus
store so downstream runtime provenance can discover it.

## Stage 2 — Conflict resolution

Moderate/high disagreements remain explicit calibration conflicts.

Every open conflict must be resolved or dismissed with a written rationale.
Resolution records are persisted separately, and the consensus snapshot's open
conflict count is synchronized.

## Stage 3 — Certification + production preparation

With zero open conflicts, the orchestrator:

1. issues the Gold Standard certificate
2. persists the locked certified version
3. persists certification audit records
4. persists the certification production-queue record
5. registers the reference
6. builds production fingerprints from the certified consensus
7. synchronizes registry coverage
8. runs production compatibility
9. approves production promotion if every check passes
10. generates and persists the production activation package

## Runtime boundary

This milestone deliberately stops at the activation package.

It does not call the Production Activation Bridge and does not publish a
runtime reference. Runtime activation remains explicit and auditable.
