import type {
  DnaDimension,
} from "@/lib/domain/fragrance";
import type {
  CatalogIntelligenceDraft,
  IntelligenceEvidenceClaim,
  IntelligencePromotionDecision,
} from "@/lib/catalog-v2/enrichment/intelligence-types";

const minimumConfidence = 70;
const requiredDnaDimensions = 12;

export function evaluateIntelligencePromotion(
  draft:
    CatalogIntelligenceDraft,
): IntelligencePromotionDecision {
  const reasons:
    string[] = [];
  const warnings:
    string[] = [];

  const dnaClaims =
    Object.entries(
      draft.dna,
    ) as Array<
      [
        DnaDimension,
        IntelligenceEvidenceClaim<number>,
      ]
    >;

  const confidentDna =
    dnaClaims.filter(
      (
        [
          ,
          claim,
        ],
      ) =>
        isConfident(
          claim,
        ),
    );

  const coverage = {
    roles:
      draft.roles.value
        .length >
        0 &&
      isConfident(
        draft.roles,
      ),

    seasons:
      draft.seasons.value
        .length >
        0 &&
      isConfident(
        draft.seasons,
      ),

    dna:
      confidentDna.length,

    moods:
      draft.moods.value
        .length >
        0 &&
      isConfident(
        draft.moods,
      ),

    performance:
      [
        draft.performance
          .longevity,
        draft.performance
          .projection,
        draft.performance
          .sillage,
      ].every(
        isConfident,
      ),
  };

  if (
    !coverage.roles
  ) {
    reasons.push(
      "Role evidence is missing or below the confidence threshold.",
    );
  }

  if (
    !coverage.seasons
  ) {
    reasons.push(
      "Season evidence is missing or below the confidence threshold.",
    );
  }

  if (
    coverage.dna <
    requiredDnaDimensions
  ) {
    reasons.push(
      `Only ${coverage.dna} DNA dimensions meet confidence requirements; ${requiredDnaDimensions} are required.`,
    );
  }

  if (
    !coverage.moods
  ) {
    reasons.push(
      "Mood evidence is missing or below the confidence threshold.",
    );
  }

  if (
    !coverage.performance
  ) {
    reasons.push(
      "Performance evidence is incomplete or below the confidence threshold.",
    );
  }

  const allClaims =
    collectClaims(
      draft,
    );

  const unsupported =
    allClaims.filter(
      (claim) =>
        !claim.evidence
          .trim(),
    );

  if (
    unsupported.length
  ) {
    reasons.push(
      `${unsupported.length} intelligence claims have no evidence text.`,
    );
  }

  const lowSourceDiversity =
    sourceDiversity(
      allClaims,
    ) <
    2;

  if (
    lowSourceDiversity
  ) {
    warnings.push(
      "Intelligence draft relies on fewer than two independent evidence origins.",
    );
  }

  const confidence =
    allClaims.length
      ? Math.round(
          allClaims.reduce(
            (
              total,
              claim,
            ) =>
              total +
              claim.confidence,
            0,
          ) /
            allClaims.length,
        )
      : 0;

  if (
    confidence <
    minimumConfidence
  ) {
    reasons.push(
      `Average intelligence confidence ${confidence}% is below the ${minimumConfidence}% promotion threshold.`,
    );
  }

  if (
    draft.status !==
    "approved"
  ) {
    reasons.push(
      "Intelligence draft has not been explicitly approved.",
    );
  }

  return {
    eligible:
      reasons.length ===
      0,
    confidence,
    reasons,
    warnings,
    coverage,
  };
}

function isConfident<T>(
  claim:
    IntelligenceEvidenceClaim<T>,
) {
  return (
    claim.confidence >=
      minimumConfidence &&
    Boolean(
      claim.evidence
        .trim(),
    )
  );
}

function collectClaims(
  draft:
    CatalogIntelligenceDraft,
) {
  return [
    draft.roles,
    draft.seasons,
    ...Object.values(
      draft.dna,
    ),
    draft.moods,
    draft.performance
      .longevity,
    draft.performance
      .projection,
    draft.performance
      .sillage,
  ].filter(
    (
      claim,
    ): claim is
      IntelligenceEvidenceClaim<unknown> =>
      Boolean(
        claim,
      ),
  );
}

function sourceDiversity(
  claims:
    IntelligenceEvidenceClaim<unknown>[],
) {
  const origins =
    new Set<string>();

  for (
    const claim
    of claims
  ) {
    if (
      claim.provenance
        ?.length
    ) {
      for (
        const source
        of claim.provenance
      ) {
        origins.add(
          source.sourceId,
        );
      }
    } else {
      origins.add(
        claim.method,
      );
    }
  }

  return origins.size;
}
