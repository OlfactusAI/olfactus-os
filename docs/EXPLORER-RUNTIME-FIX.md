# Explorer Runtime Fix

The Global Fragrance Database exposes its records through:

`database.fragrances`

Explorer incorrectly referenced:

`database.catalog`

This repair replaces every invalid Explorer reference and adds a regression
test covering brand extraction from the active database snapshot.
