# OLFACTUS OS v3.0.0-alpha.1 — Predictive Intelligence Foundation

## What this release predicts

- 90-day bottle retention / neglect risk
- signature-potential likelihood
- taste drift across fragrance DNA dimensions
- learned family and accord affinity
- adaptive recommendation probability

## Evidence model

Predictions combine:

- current collection wear counts
- days since last wear
- favorite and personal-rating signals
- persistent Memory Engine wear events
- family and accord repetition
- recent-versus-older wear DNA

If memory evidence is sparse, confidence remains low. OLFACTUS does not raise
confidence simply because a numerical score can be calculated.

## Calibration

Recommendation outcomes are tracked separately as shown, accepted, and ignored.
The calibration layer moves from `insufficient` to `learning` and eventually
`calibrated` as outcome evidence accumulates.

## Predictions workspace

`/predictions` contains:

- model confidence
- bottle forecasts
- taste drift
- preference affinities
- adaptive recommendations
- calibration status
