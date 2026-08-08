export const OLFACTUS_CANON_VERSION = "1.0" as const;

export const CANON_INVARIANTS = [
  "evidence-before-opinion",
  "traceability-before-automation",
  "independent-review-before-consensus",
  "consensus-before-certification",
  "certification-before-runtime",
  "no-silent-mutation",
  "unknown-before-fabrication",
] as const;

export type CanonInvariant = (typeof CANON_INVARIANTS)[number];
