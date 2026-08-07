# Public Dossier Build Repair

This repair resolves the beta.3 production-build failures that prevented
`/fragrance/creed-aventus` from opening.

## Fixed

- restored the missing React `useEffect` import on the Graph page
- made fragrance notes optional-safe
- made accords, roles, and perfumers optional-safe
- added readable fallback values when dossier data is missing
- added explicit callback types to sync conflict and queue filters
- removed the unsupported `displayName` field from the readiness integration
  test fixture
- added a regression test confirming that Creed Aventus resolves to
  `creed-aventus`
