# Confidence-Calibrated Scoring Repair

This repair addresses the final two calibration test failures and one build
fixture mismatch in `2.0.0-alpha.11`.

## Formula adjustment

Validated evidence now gives slightly more weight to:

- readiness confidence
- average evidence strength

This raises strong five-signal validated examples from 79% to the intended
80% or higher without changing the raw score.

## Evidence-quality adjustment

A record already classified as `partial` by the readiness gateway now receives
`partial` evidence quality when it has at least two supporting signals.
It is no longer downgraded to `insufficient` solely because its calibrated
confidence is below 45%.

## Test fixture correction

The collector profile fixture now uses the supported climate value:

`four-seasons`
