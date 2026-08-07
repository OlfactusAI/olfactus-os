import type {
  StagedCatalogRecord,
} from "@/lib/catalog-v2/staging/types";

export interface ActivationDecision {
  allowed: boolean;
  confidence: number;
  reasons: string[];
}

export function evaluateCatalogActivation(
  staged:
    StagedCatalogRecord,
): ActivationDecision {
  const reasons:
    string[] = [];

  if (
    staged.status !==
      "approved" &&
    staged.status !==
      "pending"
  ) {
    reasons.push(
      `Staging status ${staged.status} is not activation-ready.`,
    );
  }

  if (
    staged.conflicts.some(
      (conflict) =>
        conflict.status ===
        "open",
    )
  ) {
    reasons.push(
      "Open field conflicts remain.",
    );
  }

  if (
    staged.issues.some(
      (issue) =>
        issue.severity ===
        "error",
    )
  ) {
    reasons.push(
      "Validation errors remain.",
    );
  }

  const record =
    staged.record;

  const completenessSignals =
    [
      Boolean(
        record.brand,
      ),
      Boolean(
        record.name,
      ),
      Boolean(
        record.releaseYear,
      ),
      Boolean(
        record.concentration,
      ),
      Boolean(
        record.family,
      ),
      record.perfumers.length >
        0,
      record.notes.length >
        0,
      record.accords.length >
        0,
      record.provenance.length >
        0,
    ];

  const completeness =
    Math.round(
      (
        completenessSignals.filter(
          Boolean,
        ).length /
        completenessSignals.length
      ) *
        100,
    );

  const provenanceConfidence =
    record.provenance.length
      ? Math.round(
          record.provenance.reduce(
            (
              sum,
              source,
            ) =>
              sum +
              source.confidence,
            0,
          ) /
            record.provenance.length,
        )
      : 0;

  const confidence =
    Math.round(
      completeness *
        0.55 +
        provenanceConfidence *
          0.45,
    );

  if (
    confidence <
    62
  ) {
    reasons.push(
      `Activation confidence ${confidence}% is below the 62% gateway threshold.`,
    );
  }

  return {
    allowed:
      reasons.length ===
      0,
    confidence,
    reasons,
  };
}
