# OLFACTUS OS v4.5.0-alpha.3 — Dataset Review Console

This milestone adds a dedicated side-by-side review surface for submitted
Gold Standard Dataset Builder packages.

## Route

`/gold-standard-builder/review`

## Review behavior

- Reviewer A and Reviewer B values remain hidden from one another during authoring.
- Side-by-side comparison becomes available only after both drafts are submitted.
- A separate review operator can inspect claims, rationale, and evidence.
- Each claim can be approved, revision-requested, or rejected.
- Revision and rejection retain the existing mandatory-note guardrails.
- Original submitted claims are never overwritten.

## Dataset readiness

The console reports whether:

- both packages were submitted
- both packages are fully approved
- any package is blocked by rejection/revision

When both packages are fully approved, the dataset is ready for the next
milestone: consensus and certification orchestration.

## Boundary

This release does not calculate consensus or issue Gold Standard certificates.
