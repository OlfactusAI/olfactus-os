# OLFACTUS OS v4.4.2-alpha.2 — Analyst Surgical Repair

This repair fixes source corruption introduced by the prior automatic
nullability patch.

It specifically:
- rejoins identifiers split by an incorrectly placed `?? ""`
- adds nullish fallbacks only after complete optional preview member names
- removes the faulty broad source-regex test
- adds a narrow source-integrity regression test

No Catalog V2, staging, activation, graph, recommendation, or analyst
architecture is changed by this patch.
