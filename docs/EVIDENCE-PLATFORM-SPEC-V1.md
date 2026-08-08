# Evidence Platform Specification v1

## Purpose

The Evidence Platform is the source-of-record layer beneath OLFACTUS calibration. It stores sources and evidence claims as structured, versioned records and generates reviewer-facing research packs without embedding OLFACTUS scores.

## Core entities

### SourceRecord
Required fields: `sourceId`, `publisher`, `sourceType`, `locator`, `accessedAt`, `weight`, `status`, `version`.

### EvidenceRecord
Required fields: `evidenceId`, `fragranceId`, `category`, `claim`, `sourceIds`, `confidence`, `status`, `version`, `createdAt`.

Optional scope fields allow an evidence record to apply to a concentration, edition, batch era, market, date range, or release version without pretending that evidence applies universally.

### EvidenceLink
Maps evidence to a calibration section or field with a declared relationship such as `supports`, `contradicts`, `contextualizes`, or `cautions`.

### ResearchPack
A generated/frozen selection of evidence for independent reviewers. It records the included evidence versions, cautions, generation time, and a no-score policy.

## Compatibility with v4.5.0-alpha.5

The existing Aventus pack already provides the correct migration primitives:

- `sources` -> `SourceRecord`
- `facts` -> `EvidenceRecord`
- `sectionEvidence` -> `EvidenceLink`
- `reviewerCautions` -> ResearchPack cautions
- `policy.scoresIncluded === false` -> mandatory no-score invariant

The v5 evidence model extends these objects with lifecycle/version metadata. It does not invalidate the existing Aventus research pack.

## Evidence lifecycle

`draft -> reviewed -> accepted -> superseded | rejected`

Only `accepted` evidence may be used for a certifiable research pack. Historical rejected/superseded evidence remains addressable for audit purposes.

## Evidence rules

1. Evidence records contain claims, not OLFACTUS calibration values.
2. Confidence expresses confidence in the evidence record/claim, not the eventual fragrance score.
3. Conflicting evidence must be preserved and linked; it must not be silently normalized away.
4. Community aggregate values may be recorded as evidence but may not be converted directly into OLFACTUS metric scores.
5. Source access date and source identity are mandatory for web-derived evidence.
6. Generated summaries must preserve source lineage.
7. Research packs are frozen snapshots so two reviewers can be proven to have seen the same evidence version.

## Aventus migration

The current `research-pack:creed:aventus:2026-08-07` remains valid as the first frozen shared evidence snapshot. Before Gold Standard certification, it should receive repository lifecycle metadata and an integrity hash, but its facts must not be retroactively altered in place.
