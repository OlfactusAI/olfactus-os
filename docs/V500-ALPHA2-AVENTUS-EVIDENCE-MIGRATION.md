# OLFACTUS OS v5.0.0-alpha.2 — Aventus Evidence Repository Migration + Frozen Research Pack v1

## Mission

Convert the existing v4.5.0-alpha.5 Aventus Reference Research Pack into the permanent OLFACTUS v5 Evidence Platform without changing its evidence meaning or introducing calibration judgments.

## What is frozen

- 4 source records, version 1
- 16 evidence records, version 1
- 28 section-to-evidence links
- reviewer cautions from the alpha.5 pack
- a score-free policy (`scoresIncluded: false`)
- one deterministic SHA-256 integrity fingerprint

The frozen artifact is `research-pack:creed:aventus:v1`.

## Migration rules

1. Legacy source IDs remain recoverable through `legacyIdMap` and become globally namespaced v1 source IDs.
2. Legacy facts become globally namespaced `EvidenceRecord` objects. Claims, source attribution, confidence, and categories are preserved.
3. Every migrated record is `reviewed`, not `accepted` or `certified`. Certification happens downstream.
4. Legacy `sectionEvidence` entries become explicit `EvidenceLink` records.
5. Evidence categorized as `caution` uses the `cautions` relationship instead of silently supporting a score.
6. No community rating, accord, note pyramid, or performance report is converted into an OLFACTUS score.
7. Reviewer A and Reviewer B must reference exactly the same `researchPackId`.

## Integrity model

The research-pack hash is SHA-256 over canonical JSON of the frozen pack with `integrityHash` omitted. Arrays preserve order; object keys are recursively sorted.

Any change to source refs, evidence refs, section links, cautions, policy, identity, timestamps, or version changes the hash and invalidates the frozen snapshot.

## Next gate

v5.0.0-alpha.3 should implement the real Aventus Reviewer A and Reviewer B calibration workspaces/packages against `research-pack:creed:aventus:v1`. Reviewer packages must stay isolated until both are frozen/submitted.
