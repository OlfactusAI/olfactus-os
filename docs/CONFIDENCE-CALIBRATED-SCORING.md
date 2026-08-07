# OLFACTUS v2.0.0d-2 — Confidence-Calibrated Scoring

## Shared calibration API

`calibrateIntelligenceScore()` converts a raw score and its evidence into:

- score
- confidence
- uncertainty
- expected range
- evidence quality
- supporting-signal count
- inferred-signal count
- signal disagreement
- warnings
- plain-language explanation

## Calibration inputs

The engine accounts for:

- readiness confidence
- missing fields
- evidence-signal strength
- number of supporting signals
- disagreement between signals
- explicit, derived, and inferred evidence
- engine-specific warnings

## Integrated engines

- Recommendation Engine
- Deal Lab
- Blind Buy Risk
- Collection Health
- Upgrade Intelligence
- Line-family duplication analysis

Existing primary score fields remain unchanged for compatibility. Each output
now includes a standardized `calibration` object.

Search-only records remain blocked by the Intelligence Readiness Gateway and do
not receive misleading advanced scores.

## Interface

Deal Lab now displays:

- confidence percentage
- expected range
- evidence-quality label
- explanation of uncertainty
