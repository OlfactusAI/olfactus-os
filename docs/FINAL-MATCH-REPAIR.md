# OLFACTUS v2.0.0b-3 — Final Match Repair

This repair changes conflict classification so incomplete incoming metadata
does not become an identity-level conflict.

Identity-level conflicts remain:

- brand
- concentration
- release year
- fragrance family

Omitted or partial notes, accords, and perfumer data can now produce a safe
update or probable duplicate when the brand, concentration, release timing,
and normalized name align.
