# OLFACTUS OS v4.4.6-alpha.3 — Type Safety Stabilization

This is a stabilization patch for the existing Calibration Workspace
milestone. It does not advance the release version.

## Repairs

- Removes the nonexistent `Mood` import from Catalog Intelligence and the
  Reference Laboratory.
- Aligns intelligence roles with the real `FragranceRole` union.
- Aligns intelligence seasons with `Record<Season, number>`.
- Aligns the promotion gate with the current eight `DnaDimension` values.
- Removes the invalid generic type predicate in promotion claim collection.
- Adds an explicit runtime widening boundary when generic Platform Events
  enter shared Event Bus history/queue storage.
- Changes the Reference Lab route regression test to check actual
  auto-promotion APIs instead of failing because explanatory copy contains
  the words "Gold Standard".

## Behavior

No recommendation weights, fragrance data, scores, activation thresholds,
calibration values, or user-visible intelligence are changed.
