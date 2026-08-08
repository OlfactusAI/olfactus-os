# OLFACTUS OS v5.0.0-alpha.3.1 — Foundation Stabilization

This release repairs the Evidence Digest boundary before Reviewer A calibration.

## Fixes

- Replaces the stale Aventus Digest v1 integrity fingerprint with the fingerprint produced by canonical regeneration.
- Uses the Canon `EvidenceRelationship` type directly instead of narrowing Research Pack links.
- Preserves `contextualizes` as its own digest relationship bucket.
- Adds a regression test proving FrozenResearchPack compatibility and deterministic digest reproduction.

## Non-goals

This release does not add calibration values, reviewer conclusions, consensus decisions, certificates, runtime values, or intelligence features.

## Build-integrity policy

The installer does not auto-edit unrelated UI/orchestrator source files using unsafe line-number patches. It runs a focused post-install preflight and reports any remaining TypeScript failures verbatim so they can be repaired against the exact repository source rather than hidden with `any`, `@ts-ignore`, optional certificates, or non-null assertions without a proven invariant.
