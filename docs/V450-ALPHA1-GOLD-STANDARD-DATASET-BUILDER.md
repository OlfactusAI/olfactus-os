# OLFACTUS OS v4.5.0-alpha.1 — Gold Standard Dataset Builder

This milestone begins the transition from infrastructure-building to real
reference-data production.

## Route

`/gold-standard-builder`

## Purpose

The builder creates real fragrance reference targets and two independent
calibration drafts. It does not pre-populate fragrance intelligence.

The existing Reference Laboratory remains the place where reviewers author:

- scores
- confidence
- rationale
- evidence
- source references

## Dataset lifecycle

Target → Authoring → Review → Consensus → Certification → Registry →
Fingerprints → Promotion → Activation

The builder includes orchestration helpers for each downstream stage, but they
will fail closed if the prerequisite data is missing.

## Integrity rule

No fragrance scores, evidence, consensus values, or certificates are invented
by this release.

The first target can be Creed Aventus, but Aventus becomes Gold Standard only
after real reviewer-authored calibration data passes the governance pipeline.
