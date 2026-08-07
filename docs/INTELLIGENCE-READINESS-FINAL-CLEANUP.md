# Intelligence Readiness Final Cleanup

This cleanup resolves the last failed suite and the stale Collection Health
runtime error.

## Changes

- explicitly imports `filterCatalogForEngine` in Collection Health
- removes the nonexistent `@/lib/data/profile` test dependency
- uses a self-contained collector profile fixture
- clears `.next` and Turbopack cache files during installation
- verifies the readiness import before completing installation
