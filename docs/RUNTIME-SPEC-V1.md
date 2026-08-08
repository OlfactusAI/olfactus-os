# Runtime Reference Specification v1

## Purpose

The runtime reference is the stable, certified object consumed by OLFACTUS intelligence modules. It is intentionally smaller than the evidence/reviewer/consensus record.

## Runtime invariants

1. Every runtime object points to an active registry record and certificate.
2. Every published calibration field is derived from approved consensus.
3. Draft rationale and reviewer-private notes are excluded.
4. Runtime objects are immutable by version.
5. Activation/deactivation is explicit and audited.
6. Modules may not silently fall back to authoring data when runtime data is absent.

## Required envelope

- `referenceId`
- `fragranceId`
- `referenceVersion`
- `runtimeVersion`
- `certificateId`
- `consensusId`
- `registryId`
- `activatedAt`
- `status`
- `calibration`
- `fingerprints`
- `traceability`

## Module contract

Recommendation Engine, Duplication Detector, Rotation Optimizer, Blind Buy Risk, Collection Health, Signature Finder, Value Analyzer, Global Scent Explorer, and other production modules must consume certified runtime references through a common read contract.

A module may compute a derived result from runtime fields, but it must identify which runtime references and versions contributed to that result.

## Failure behavior

If required certified data is absent, a module returns an explicit insufficient-data or unavailable state. It must not invent substitute values.
