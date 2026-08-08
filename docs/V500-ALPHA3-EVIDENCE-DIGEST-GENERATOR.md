# OLFACTUS OS v5.0.0-alpha.3 — Evidence Digest Generator

## Purpose

Create a deterministic reviewer-facing organization layer from a frozen Research Pack without introducing calibration judgments.

The Evidence Digest is **derived**, never authoritative. The Evidence Repository and Frozen Research Pack remain the provenance-bearing source of truth.

## Invariants

1. A digest is bound to one exact Research Pack ID and SHA-256 fingerprint.
2. It may summarize structural coverage, source diversity, evidence confidence metadata, cautions, contradictions, and gaps.
3. It may not contain calibration scores, recommendations, verdicts, community ratings as derived metrics, or reviewer conclusions.
4. Every claim shown in the digest must resolve to a frozen EvidenceRecord.
5. Every source shown in the digest must resolve to a frozen SourceRecord.
6. Regenerating a digest from the same frozen pack and generator version must reproduce the same artifact.
7. Reviewer A and Reviewer B receive the same digest but remain independently calibrated.

## Aventus Digest v1

Input: `research-pack:creed:aventus:v1`

Sections represented:

- DNA
- Performance
- Roles
- Seasons
- Weather
- Time
- Formality
- Mood
- Collector

The generator exposes evidence coverage and deficiencies rather than manufacturing evidence to fill them.
