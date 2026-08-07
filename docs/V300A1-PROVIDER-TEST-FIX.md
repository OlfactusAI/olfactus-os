# OLFACTUS v3.0.0-alpha.1 Provider + Build Test Repair

Two independent issues remained after Predictive Intelligence was added.

## Runtime provider order

`PredictiveProvider` calls:

- `useActiveFragranceCatalog()`
- `useCollection()`
- `useMemoryEngine()`

It therefore must be nested inside all three providers. The corrected
hierarchy is:

AccountProvider
└── ActiveCatalogProvider
    └── CollectionProvider
        └── MemoryProvider
            └── PredictiveProvider
                └── IntelligenceEverywhereProvider
                    └── OlfactusOSProvider
                        └── NavigationProvider
                            └── AppShell

## TypeScript build test

The Analyst test accessed `result.response.fragranceId` again inside a
callback. TypeScript does not preserve that property access safely across
the full response union. The test now stores the narrowed fragrance ID
in a local variable before entering the callback.
