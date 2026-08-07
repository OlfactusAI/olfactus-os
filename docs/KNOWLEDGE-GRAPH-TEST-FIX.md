# OLFACTUS v1.7.0b — Knowledge Graph Test Fix

The Knowledge Graph integration test was still asserting that the entire
application version must equal `1.5.0`.

That assertion became invalid after Market Intelligence Stable moved the app to
v1.6.0 and Collection Evolution moved it to v1.7.0 alpha.

The corrected test now validates the stable Knowledge Graph requirement that
actually matters:

- the system manifest remains on the stable channel
- `Knowledge Graph Intelligence` remains registered

The test no longer blocks future application versions.
