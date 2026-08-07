# OLFACTUS OS v4.4.6-alpha.5 — Reference Intelligence Laboratory: Consensus + Conflict Detection

Milestone 4 of the Reference Intelligence Laboratory.

## Consensus rules

Consensus requires:

- at least two independently submitted calibration packages
- the same fragrance
- the same calibration version
- package state `approved`

Revision-requested, rejected, submitted, and partially reviewed packages do not
participate.

## Math

For each numeric domain/metric:

- consensus value = confidence-weighted mean
- reviewer count is retained
- population variance is retained
- score range is retained indirectly through conflict classification
- consensus confidence is reduced by disagreement

Default conflict thresholds:

- range <= 8: none
- range 9–18: low
- range 19–30: moderate
- range > 30: high

Moderate and high disagreement creates an open calibration conflict.

## Conflict resolution

Open conflicts can be:

- resolved
- dismissed

Both require a written explanation and resolver identity. Resolution records are
stored separately from the original reviewer claims.

## Guardrail

Consensus is advisory only in this milestone. It does not:

- issue Gold Standard certificates
- lock calibration versions
- promote Catalog V2 intelligence
- activate records in NRE
- overwrite reviewer submissions

Gold Standard certification remains the next milestone.
