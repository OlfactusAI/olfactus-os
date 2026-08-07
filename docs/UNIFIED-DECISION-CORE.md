# OLFACTUS OS v4.1.0-alpha.1 — Unified Decision Core + Intelligence API Migration

## Unified Decision Core

`UDC-1.0.0` is the first central decision authority in OLFACTUS.

Candidate decisions:
- BUY
- SAMPLE
- WAIT
- SKIP
- REPLACE

Owned-bottle decisions:
- KEEP
- REVISIT
- SELL

The core combines learned taste fit, future role need, redundancy,
Collection Health impact, retention, price exposure, and canonical
collector confidence. Every result contains evidence factors, model
references, confidence, risk, and score provenance.

## Intelligence API migration

This release begins migrating major consumers away from raw independent
state reads.

- Analyst resolves collection, catalog, and Collection Health through the
  Unified Intelligence API.
- Today uses Canonical Collector State and RE-4.1 unified recommendations.
- Simulator reads collection and catalog context from Collector Intelligence.
- Decision Lab surfaces UDC alongside its existing deep analysis so migration
  can occur safely without removing validated legacy calculations.

## Recommendation model

`RE-4.1.0` uses the existing weather/season recommendation engine, then
re-ranks with personal forecast state and Personal Intelligence Graph wear
evidence.

## Migration strategy

Existing engines are not deleted in this release. They remain validated
submodels behind a unified orchestration layer. This prevents a risky
rewrite while eliminating page-by-page collector truth divergence.
