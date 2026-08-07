# OLFACTUS v2.0.0d-1 — Intelligence Readiness Gateway

The shared gateway evaluates every fragrance before advanced scoring.

## API

- `evaluateIntelligenceEligibility(fragrance)`
- `isEligibleForEngine(fragrance, engine)`
- `filterCatalogForEngine(catalog, engine)`
- `assertEligibleForEngine(fragrance, engine)`

## Readiness levels

- Ready
- Partial
- Search only
- Blocked

## Initial enforcement

- Recommendation Engine
- Deal Lab
- Blind Buy Risk
- Collection Health
- Upgrade Intelligence

Partial records remain usable with capped confidence and warnings. Search-only
records remain visible in Universal Search and Explorer but are excluded from
authoritative advanced scoring.
