# OLFACTUS v2.0.0b-3 — Repair

This repair resolves the match-engine regressions and TypeScript failures in
`2.0.0-alpha.4`.

## Match Engine

- expands EDP, EDT, and EDC abbreviations before name comparison
- compares base fragrance-line names independently of concentration
- detects concentration variants even when their overall weighted score is low
- improves alternate-name duplicate matching

## Domain compatibility

- maps imported roles to the existing OLFACTUS role vocabulary
- uses `calibration` for imported intelligence status
- creates valid `DatabaseSourceReference` objects
- types column aliases explicitly
- updates stale test fixtures from `date-night` to `date`
