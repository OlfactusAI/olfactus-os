# OLFACTUS v2.0.0c-1 — Repair

This repair aligns Universal Search with the actual database schema.

## Corrected assumptions

- Brand membership is derived from fragrance `brandId` values.
- Perfumer membership is derived from fragrance `perfumerIds`.
- Brand entities no longer assume `segment` or `fragranceIds`.
- Perfumer entities no longer assume `nationality`, `signatureNoteIds`, or
  `fragranceIds`.
- Note documents use `category`, `naturality`, and `description`.
- Ratings use `score`, `scaleMaximum`, and `voteCount`.
- Optional arrays are handled safely.
- Import Workspace types are re-exported from the import facade.
