import {
  evaluateIntelligenceEligibility,
} from "@/lib/intelligence/readiness-gateway";
import {
  calibrateIntelligenceScore,
  type CalibratedIntelligenceScore,
} from "@/lib/intelligence/confidence-calibration";
import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  DnaDimension,
} from "@/lib/domain/fragrance";
import type {
  GlobalFragranceDatabase,
  GlobalFragranceRecord,
} from "@/lib/database/schema";
import type {
  FragranceLine,
  LineageNode,
} from "@/lib/lineage/types";

export interface UpgradeAnalysis {
  ownedFragranceId: string;
  candidateFragranceId: string;
  upgradeScore: number;
  complementScore: number;
  replacementScore: number;
  buyConfidence: number;
  calibration:
    CalibratedIntelligenceScore;
  dnaSeparation: number;
  collectionGain: number;
  performanceGain: number;
  roleGain: number;
  verdict:
    | "strong-complement"
    | "upgrade"
    | "replacement"
    | "redundant"
    | "situational";
  explanation: string;
}

export interface FamilyRedundancyItem {
  fragranceId: string;
  keepScore: number;
  redundancyScore: number;
  recommendation:
    | "keep"
    | "consider-selling"
    | "optional";
  reason: string;
}

export interface FamilyRedundancyAnalysis {
  lineId: string;
  ownedMemberIds: string[];
  familyRedundancy: number;
  calibration:
    CalibratedIntelligenceScore;
  items: FamilyRedundancyItem[];
  summary: string;
}

const dnaDimensions:
  DnaDimension[] = [
    "fresh",
    "green",
    "woody",
    "amber",
    "sweet",
    "dark",
    "artistic",
    "formal",
  ];

export function analyzeUpgrade({
  owned,
  candidate,
  collection,
}: {
  owned: GlobalFragranceRecord;
  candidate: GlobalFragranceRecord;
  collection: CollectionItem[];
}): UpgradeAnalysis {
  const dnaSeparation =
    calculateDnaSeparation(
      owned,
      candidate,
    );

  const performanceGain =
    clamp(
      Math.round(
        ((candidate.performance
          .longevity -
          owned.performance
            .longevity) *
          0.58 +
          (candidate.performance
            .projection -
            owned.performance
              .projection) *
            0.42),
      ),
    );

  const ownedRoles =
    new Set(
      collection.flatMap(
        () => owned.roles,
      ),
    );

  const roleGain =
    candidate.roles.filter(
      (role) =>
        !ownedRoles.has(role),
    ).length;

  const collectionGain =
    clamp(
      Math.round(
        dnaSeparation * 0.5 +
          roleGain * 12 +
          Math.max(
            0,
            candidate.dna.artistic -
              owned.dna.artistic,
          ) *
            0.2,
      ),
    );

  const complementScore =
    clamp(
      Math.round(
        dnaSeparation * 0.55 +
          roleGain * 14 +
          Math.max(
            0,
            candidate.dna.formal -
              owned.dna.formal,
          ) *
            0.12,
      ),
    );

  const replacementScore =
    clamp(
      Math.round(
        Math.max(
          0,
          100 - dnaSeparation,
        ) *
          0.45 +
          Math.max(
            0,
            candidate.performance
              .longevity -
              owned.performance
                .longevity,
          ) *
            1.3 +
          Math.max(
            0,
            candidate.performance
              .projection -
              owned.performance
                .projection,
          ) *
            0.8,
      ),
    );

  const upgradeScore =
    clamp(
      Math.round(
        performanceGain * 0.35 +
          collectionGain * 0.35 +
          candidate.dna.artistic *
            0.15 +
          candidate.dataQualityScore *
            0.15,
      ),
    );

  const buyConfidence =
    clamp(
      Math.round(
        upgradeScore * 0.42 +
          complementScore * 0.32 +
          Math.max(
            replacementScore,
            collectionGain,
          ) *
            0.26,
      ),
    );

  const verdict =
    determineVerdict({
      dnaSeparation,
      complementScore,
      replacementScore,
      upgradeScore,
      collectionGain,
    });
  const eligibility =
    evaluateIntelligenceEligibility(
      candidate,
    );
  const calibration =
    calibrateIntelligenceScore({
      rawScore:
        upgradeScore,
      eligibility,
      evidenceSignals: [
        {
          id:
            "dna-separation",
          strength:
            dnaSeparation,
          source: "derived",
        },
        {
          id:
            "collection-gain",
          strength:
            collectionGain,
          source: "derived",
        },
        {
          id:
            "performance-gain",
          strength:
            Math.max(
              0,
              Math.min(
                100,
                50 +
                  performanceGain,
              ),
            ),
          source: "derived",
        },
        {
          id:
            "data-quality",
          strength:
            candidate.dataQualityScore,
          source: "explicit",
        },
      ],
    });

  return {
    ownedFragranceId:
      owned.id,
    candidateFragranceId:
      candidate.id,
    upgradeScore,
    complementScore,
    replacementScore,
    buyConfidence:
      Math.min(
        buyConfidence,
        calibration.confidence,
      ),
    calibration,
    dnaSeparation,
    collectionGain,
    performanceGain,
    roleGain,
    verdict,
    explanation:
      explainVerdict({
        verdict,
        dnaSeparation,
        roleGain,
        performanceGain,
      }),
  };
}

export function analyzeFamilyRedundancy({
  line,
  database,
  collection,
}: {
  line: FragranceLine;
  database: GlobalFragranceDatabase;
  collection: CollectionItem[];
}): FamilyRedundancyAnalysis {
  const ownedIds =
    new Set(
      collection.map(
        (item) =>
          item.fragranceId,
      ),
    );

  const ownedNodes =
    line.members.filter(
      (node) =>
        ownedIds.has(
          node.fragranceId,
        ),
    );

  const ownedFragrances =
    ownedNodes
      .map((node) =>
        database.fragrances.find(
          (fragrance) =>
            fragrance.id ===
            node.fragranceId,
        ),
      )
      .filter(
        (
          fragrance,
        ): fragrance is GlobalFragranceRecord =>
          Boolean(fragrance),
      );

  if (
    ownedFragrances.length < 2
  ) {
    return {
      lineId: line.id,
      ownedMemberIds:
        ownedFragrances.map(
          (fragrance) =>
            fragrance.id,
        ),
      familyRedundancy: 0,
      calibration:
        calibrateIntelligenceScore({
          rawScore: 0,
          eligibility:
            ownedFragrances[0]
              ? evaluateIntelligenceEligibility(
                  ownedFragrances[0],
                )
              : {
                  readiness:
                    "partial",
                  confidence: 55,
                  allowedEngines: [
                    "duplication",
                  ],
                  restrictedEngines: [],
                  warnings: [
                    "Only one owned line member is available.",
                  ],
                  missingFields: [
                    "comparison-set",
                  ],
                },
          evidenceSignals:
            ownedFragrances.map(
              (fragrance) => ({
                id: fragrance.id,
                strength:
                  fragrance.dataQualityScore,
                source:
                  "explicit" as const,
              }),
            ),
        }),
      items:
        ownedFragrances.map(
          (fragrance) => ({
            fragranceId:
              fragrance.id,
            keepScore: 100,
            redundancyScore: 0,
            recommendation:
              "keep",
            reason:
              "Only owned release from this family.",
          }),
        ),
      summary:
        "No meaningful family redundancy detected.",
    };
  }

  const pairwise =
    ownedFragrances.flatMap(
      (fragrance, index) =>
        ownedFragrances
          .slice(index + 1)
          .map((other) =>
            100 -
            calculateDnaSeparation(
              fragrance,
              other,
            ),
          ),
    );

  const familyRedundancy =
    average(pairwise);

  const items =
    ownedFragrances.map(
      (fragrance) => {
        const peers =
          ownedFragrances.filter(
            (peer) =>
              peer.id !==
              fragrance.id,
          );

        const redundancyScore =
          average(
            peers.map(
              (peer) =>
                100 -
                calculateDnaSeparation(
                  fragrance,
                  peer,
                ),
            ),
          );

        const distinctiveness =
          100 -
          redundancyScore;

        const keepScore =
          clamp(
            Math.round(
              distinctiveness * 0.4 +
                fragrance.performance
                  .longevity *
                  0.2 +
                fragrance.performance
                  .projection *
                  0.14 +
                fragrance.dna
                  .artistic *
                  0.16 +
                fragrance.roles
                  .length *
                  2.5,
            ),
          );

        const recommendation =
          redundancyScore >= 82 &&
          keepScore < 72
            ? "consider-selling"
            : keepScore >= 76
              ? "keep"
              : "optional";

        return {
          fragranceId:
            fragrance.id,
          keepScore,
          redundancyScore,
          recommendation,
          reason:
            recommendation ===
            "consider-selling"
              ? "High overlap with stronger releases in the same family."
              : recommendation ===
                  "keep"
                ? "Adds enough performance, role, or DNA distinction to justify ownership."
                : "Useful, but not essential if collection space is limited.",
        } satisfies FamilyRedundancyItem;
      },
    );

  const familyEligibility =
    ownedFragrances
      .map((fragrance) =>
        evaluateIntelligenceEligibility(
          fragrance,
        ),
      )
      .sort(
        (a, b) =>
          a.confidence -
          b.confidence,
      )[0];
  const calibration =
    calibrateIntelligenceScore({
      rawScore:
        familyRedundancy,
      eligibility:
        familyEligibility,
      evidenceSignals:
        pairwise.map(
          (strength, index) => ({
            id:
              `pair-${index + 1}`,
            strength,
            source:
              "derived" as const,
          }),
        ),
    });

  return {
    lineId: line.id,
    ownedMemberIds:
      ownedFragrances.map(
        (fragrance) =>
          fragrance.id,
      ),
    familyRedundancy,
    calibration,
    items,
    summary:
      familyRedundancy >= 80
        ? "This family is highly redundant in your collection."
        : familyRedundancy >= 60
          ? "This family has moderate overlap."
          : "The owned releases are meaningfully differentiated.",
  };
}

export function calculateDnaSeparation(
  first: GlobalFragranceRecord,
  second: GlobalFragranceRecord,
) {
  const averageDifference =
    dnaDimensions.reduce(
      (sum, dimension) =>
        sum +
        Math.abs(
          first.dna[
            dimension
          ] -
            second.dna[
              dimension
            ],
        ),
      0,
    ) / dnaDimensions.length;

  const roleDifference =
    symmetricDifference(
      first.roles,
      second.roles,
    ).length * 3;

  const familyDifference =
    first.family ===
    second.family
      ? 0
      : 10;

  return clamp(
    Math.round(
      averageDifference +
        roleDifference +
        familyDifference,
    ),
  );
}

function determineVerdict({
  dnaSeparation,
  complementScore,
  replacementScore,
  upgradeScore,
  collectionGain,
}: {
  dnaSeparation: number;
  complementScore: number;
  replacementScore: number;
  upgradeScore: number;
  collectionGain: number;
}): UpgradeAnalysis["verdict"] {
  if (
    dnaSeparation < 18 &&
    collectionGain < 28
  ) {
    return "redundant";
  }

  if (
    replacementScore >= 78 &&
    dnaSeparation < 35
  ) {
    return "replacement";
  }

  if (
    complementScore >= 76 &&
    dnaSeparation >= 35
  ) {
    return "strong-complement";
  }

  if (
    upgradeScore >= 72
  ) {
    return "upgrade";
  }

  return "situational";
}

function explainVerdict({
  verdict,
  dnaSeparation,
  roleGain,
  performanceGain,
}: {
  verdict: UpgradeAnalysis["verdict"];
  dnaSeparation: number;
  roleGain: number;
  performanceGain: number;
}) {
  if (
    verdict ===
    "strong-complement"
  ) {
    return `Meaningful DNA separation (${dnaSeparation}%) with ${roleGain} new role${roleGain === 1 ? "" : "s"}. Best treated as a complement rather than a replacement.`;
  }

  if (
    verdict === "replacement"
  ) {
    return `Very similar DNA with a stronger performance profile. Best considered as a direct upgrade or replacement.`;
  }

  if (
    verdict === "upgrade"
  ) {
    return `Improves performance by ${performanceGain} points while adding measurable collection value.`;
  }

  if (
    verdict === "redundant"
  ) {
    return `Minimal DNA separation and limited collection gain. Owning both is difficult to justify.`;
  }

  return `Adds some value, but the case depends on price, role preference, and attachment to the original.`;
}

function symmetricDifference<
  Value extends string,
>(
  first: readonly Value[],
  second: readonly Value[],
) {
  const firstSet =
    new Set(first);
  const secondSet =
    new Set(second);

  return [
    ...first.filter(
      (value) =>
        !secondSet.has(value),
    ),
    ...second.filter(
      (value) =>
        !firstSet.has(value),
    ),
  ];
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length,
  );
}

function clamp(value: number) {
  return Math.max(
    0,
    Math.min(100, value),
  );
}
