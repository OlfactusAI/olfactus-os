# Sprint 003 — Buy Decision Engine

## Permanent capability

OLFACTUS can now evaluate an unowned fragrance against the live collection and return an explainable purchase decision.

## Inputs

- Candidate canonical fragrance record
- Current collection
- Collector profile and climate
- Optional expected purchase price

## Outputs

- `BUY`, `SAMPLE FIRST`, or `SKIP`
- Fit score
- Risk score
- Confidence
- Five evidence signals
- Closest functional overlap
- Current and projected Collection Health
- Newly added roles
- Model version `BDE-1.0.0`

## Scoring signals

1. Climate fit
2. Role contribution
3. Redundancy safety
4. Fragrance quality signal
5. Projected Collection Health
6. Intelligence record readiness
7. Price risk

## UI integration

The permanent `/decisions` route now contains the interactive Buy Decision experience. Candidate and price changes recalculate the decision immediately. A positive decision can add the fragrance directly to shared Collection state, causing Today and Collection Health to update.

## Tests

- Strategic green/marine candidate evaluation
- Price-risk sensitivity
- Already-owned candidate rejection
