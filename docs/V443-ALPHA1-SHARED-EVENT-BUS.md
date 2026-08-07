# OLFACTUS OS v4.4.3-alpha.1 — Shared Event Bus Foundation

This milestone adds a typed runtime coordination layer without replacing any
persistent collector, memory, prediction, or timeline ledger.

## Event Bus vs. Event Ledger

- **Event Bus:** runtime publish/subscribe coordination and short diagnostic
  history.
- **Ledgers:** durable/replayable historical truth.

## Initial integrations

1. Unified Registry publishes `platform.registry.refreshed`.
2. Catalog V2 batch processing publishes staged, activation-evaluated,
   completed, and rolled-back events.

## Guarantees

- typed payloads
- deterministic per-bus event IDs
- correlation and causation metadata
- bounded runtime history
- subscribe / subscribeOnce / subscribeAll / unsubscribe
- nested-publish queue ordering
- subscriber error isolation
- no React dependency in the bus itself

Future milestones can subscribe prediction, recommendation, memory, graph, and
Collection Twin systems without introducing direct module-to-module calls.
