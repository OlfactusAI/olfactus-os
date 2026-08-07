# OLFACTUS v2.2.0-alpha.2 Navigation and Profile Fixture Repair

This repair resolves two production-build blockers:

1. `GitCompareArrows` was referenced by the Entity Compare workspace but was
   not imported from `lucide-react`. This caused navigation module evaluation
   to fail and returned HTTP 500 for all app routes.

2. The readiness integration test still used removed `CollectorProfile`
   properties. The obsolete fields `displayName`, `goals`, and
   `preferredFamilies` have been removed from the fixture.

Regression tests now verify both contracts.
