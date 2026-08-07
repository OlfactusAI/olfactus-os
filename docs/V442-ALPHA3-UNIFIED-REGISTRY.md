# OLFACTUS OS v4.4.2-alpha.3 — Platform Consolidation: Unified Registry

Milestone 1 of the platform-consolidation release introduces the Unified Registry.

The registry owns the shared runtime view of:

- canonical collector state
- active fragrance catalog
- catalog identity lookup
- ownership lookup
- collection-item lookup
- personal intelligence graph
- global intelligence service

The existing Unified Intelligence API remains the application-facing boundary,
but now resolves its core contexts through the registry rather than constructing
parallel maps and graph services independently.

This is intentionally backward compatible. Existing consumers can continue using
`getCollectorState()`, `getCatalogContext()`, `getGraphContext()`, and global graph
methods. New platform modules can use `getRegistry()` when they need the unified
runtime source of truth.

Next milestones:

1. Shared Event Bus
2. Unified Intelligence Context
3. Catalog Activation Bridge
4. Shared Intelligence Result contract
