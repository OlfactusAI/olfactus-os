# OLFACTUS OS v4.3.0-alpha.1 — Integration Repair

This repair addresses the three issues found by the v4.3 release gate.

## System client directive

The Global Intelligence Network installer inserted a provider import above
`"use client"`. Next.js requires the client directive to be the first
executable statement in a Client Component. The repair restores the directive
to line 1 and removes duplicate directives.

## System manifest test

The application manifest was correctly upgraded to `4.3.0-alpha.1`, while an
older v4.2 test still expected `4.2.0-alpha.1`. The test now verifies the
current release and also confirms that Personal Fragrance Language and
Preference Embedding remain registered.

## Accord registry test

`FragranceRecord.accords` is optional and the current bundled catalog does not
necessarily populate it. Entity Registry 2.0 correctly creates accord nodes
only when accord data exists. The test now verifies that runtime accord nodes
match the actual catalog data while separately asserting that `accord` remains
a first-class Global Entity type.

No graph behavior is removed or weakened by this repair.
