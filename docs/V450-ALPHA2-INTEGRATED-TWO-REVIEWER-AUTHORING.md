# OLFACTUS OS v4.5.0-alpha.2 — Integrated Two-Reviewer Authoring Workspace

This milestone makes real reference-data authoring usable directly inside the
Gold Standard Dataset Builder.

## Added

- Reviewer A / Reviewer B switching
- strict draft independence
- per-reviewer autosave
- section-by-section authoring progress
- missing-field summaries
- dataset-level readiness
- sticky authoring controls
- integrated score, confidence, rationale, evidence, and optional source URL
- Submit Both for Review gate

## Independence

Editing Reviewer A updates only Reviewer A's draft. Reviewer B's values are not
copied, synchronized, or displayed in Reviewer A's authoring surface.

## Submission rule

Both independent reviewer drafts must have every required metric complete with:

- score
- confidence
- rationale
- evidence

Only then can the dataset move from `authoring` to `review`.

Submission does not approve either package.
