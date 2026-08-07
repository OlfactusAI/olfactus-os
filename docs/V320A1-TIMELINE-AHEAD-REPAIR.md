# OLFACTUS v3.2.0-alpha.1 — Future Timeline + Today Ahead Repair

## Future Timeline

Forecast horizons must never create or remove owned bottles. The forecasting
layer now deduplicates projected collection items by `fragranceId`, and the
Predictions UI derives one stable owned ID list from the `Now` horizon.

Changing from 30 days to 90 days, 6 months, or 1 year may change a bottle's
future state, but not its identity or the number of owned bottles represented.

## Today Ahead

`PredictiveAhead` is mounted directly into the visible Today composition before
the live mission-control section.

The Ahead card also remains visible during low-evidence calibration instead of
returning `null`, so users can see that Predictive Intelligence is present even
before enough historical data exists for a rich forecast.
