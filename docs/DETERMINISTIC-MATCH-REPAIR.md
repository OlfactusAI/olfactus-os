# Deterministic Match Repair

This repair makes import identity decisions deterministic.

- Explicit ID conflicts are evaluated before weighted score thresholds.
- `EDP`, `EDT`, and `EDC` normalize to canonical concentrations.
- Placeholder values such as `Unknown` are treated as missing data.
- Alternate release names can resolve as probable duplicates or safe updates.
- Genuine year, brand, concentration, or family conflicts remain blocked.
