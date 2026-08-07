# OLFACTUS v3.2.0-alpha.1 — Forecast Realism Repair

The first Future Collection Timeline was structurally correct but too
optimistic. Bottles effectively continued receiving future wears forever,
which froze Active Rotation, suppressed neglect, and kept DNA/Signature
metrics nearly unchanged. Low model confidence also produced health bands
as wide as 64–100.

## Corrected behavior

- Future wear rates decay with horizon.
- Strong repeat-use/favorite evidence protects frequently used bottles.
- Weak or stale bottles progressively move through Watch, Neglect Risk,
  and Removal Candidate.
- Neglected future bottles stop contributing fully to effective future
  Collection Health.
- Future DNA is calculated from the projected active rotation.
- Signature Stability is recomputed from future core/signature bottles.
- Health includes inactivity, watch, and long-horizon behavior penalties.
- Forecast uncertainty widens gradually and is capped at a useful level.

The goal is not to force every metric to change. Strong collections can
remain stable. The requirement is that metrics now respond to the actual
projected behavior rather than remaining mechanically frozen.
