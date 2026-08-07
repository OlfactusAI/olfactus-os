# OLFACTUS OS v4.4.4-alpha.1 — Unified Intelligence Context Foundation

This milestone introduces one deterministic intelligence snapshot shared by
core reasoning systems.

## What changed

- Added `UnifiedIntelligenceContext` (`UIC-1.0.0`)
- Added deterministic `contextId`
- Added top-level immutable context snapshots
- Added context lifecycle events to the Shared Event Bus
- Exposed `getIntelligenceContext()` through the Unified Intelligence API
- Routed Neural Recommendation Engine 2 through the shared context
- Routed Unified Analyst + semantic reasoning through the shared context
- Routed Unified Decision Core through the shared context
- Exposed the same API-created context through CollectorIntelligenceProvider

## What did not change

- Recommendation scoring weights
- Decision scoring weights
- Analyst response contracts
- Catalog activation behavior
- Collector Event Ledger semantics
- Shared Event Bus dispatch semantics

The purpose of this release is context consistency, not new recommendation
behavior.
