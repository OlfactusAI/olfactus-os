# OLFACTUS OS v4.0.0-alpha.1 — Personal Intelligence Graph Foundation

This release is architecture-first. It establishes one shared intelligence
layer above Collection, Memory, Prediction, Simulator, and the global
fragrance database.

## Canonical Collector State

`deriveCanonicalCollectorState()` combines current collection, collector
profile, replayed memory events, Memory insights, Collector DNA, learned
family/accord affinities, Predictive Intelligence, and Collection Forecast
into the versioned `COLLECTOR-STATE-1.0.0` snapshot.

## Event-sourced derivation

`replayCollectorEvents()` derives behavior from immutable Memory events.
It reconstructs wears, views, simulations, navigation, recommendation
outcomes, and corrections without mutating historical events.

## Personal Intelligence Graph

`PIG-1.0.0` represents personal relationships such as OWNS, WORE,
FAVORITE, PREFERS, VIEWED, VISITED, PREDICTED-SIGNATURE, and
PREDICTED-RISK. Fragrance nodes retain their global fragrance IDs, keeping
the global graph and personal graph cleanly separated.

## Unified Intelligence API

The initial stable API exposes:
- getCollectorState()
- getPreferenceProfile()
- getMemoryContext()
- getPredictionContext()
- getRecommendationContext()
- getFragranceState(id)
- getGraphContext()
- getModelContext()
- searchPersonalGraph(query)

Future OLFACTUS surfaces should migrate toward this API instead of reading
raw local storage or independently recalculating collector truth.

## Confidence provenance

Scores can now store their model identity, confidence, normalized evidence
contributions, limitations, and generation timestamp.

## Model registry

Intelligence models are explicitly versioned, including Canonical Collector
State, Personal Intelligence Graph, Recommendation, Retention, Signature,
Taste Drift, Collection Forecast, Memory, Calibration, and Simulator.

## Provider hierarchy

`CollectorIntelligenceProvider` mounts inside `PredictiveProvider` and
before downstream intelligence consumers, because it depends on catalog,
collection, memory, prediction, and forecast state.
