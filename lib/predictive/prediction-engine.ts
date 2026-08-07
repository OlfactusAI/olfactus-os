import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  MemoryEvent,
} from "@/lib/memory/types";
import {
  buildAccordAffinities,
  buildFamilyAffinities,
} from "@/lib/predictive/preference-model";
import {
  detectTasteDrift,
} from "@/lib/predictive/drift-engine";
import type {
  AdaptiveRecommendation,
  BottlePrediction,
  PredictiveSnapshot,
  PredictionEvidence,
} from "@/lib/predictive/types";

export function buildPredictiveSnapshot({
  collection,
  catalog,
  events,
}: {
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  events:
    MemoryEvent[];
}): PredictiveSnapshot {
  const familyAffinities =
    buildFamilyAffinities({
      events,
      catalog,
    });
  const accordAffinities =
    buildAccordAffinities({
      events,
      catalog,
    });
  const tasteDrift =
    detectTasteDrift({
      events,
      catalog,
    });

  const bottlePredictions =
    predictOwnedBottles({
      collection,
      catalog,
      events,
      familyAffinities,
      accordAffinities,
    });

  const adaptiveRecommendations =
    buildAdaptiveRecommendations({
      collection,
      catalog,
      familyAffinities,
      accordAffinities,
      tasteDrift,
    });

  const predictiveEvidence =
    events.filter(
      (event) =>
        event.type ===
          "wear-recorded" ||
        event.type ===
          "favorite-changed" ||
        event.type ===
          "recommendation-accepted" ||
        event.type ===
          "recommendation-ignored" ||
        event.type ===
          "comparison-executed",
    ).length;

  const topSignatureCandidate =
    [...bottlePredictions]
      .sort(
        (a, b) =>
          b.signaturePotential -
          a.signaturePotential,
      )[0];
  const highestRetentionRisk =
    [...bottlePredictions]
      .sort(
        (a, b) =>
          b.retentionRisk -
          a.retentionRisk,
      )[0];

  return {
    generatedAt:
      new Date().toISOString(),
    modelVersion:
      "PI-3.0.0-alpha.1",
    confidence:
      confidenceFromEvidence(
        predictiveEvidence,
      ),
    bottlePredictions,
    familyAffinities,
    accordAffinities,
    tasteDrift,
    adaptiveRecommendations,
    strongestDrift:
      tasteDrift[0],
    topSignatureCandidate,
    highestRetentionRisk,
    evidenceEvents:
      predictiveEvidence,
  };
}

function predictOwnedBottles({
  collection,
  catalog,
  events,
  familyAffinities,
  accordAffinities,
}: {
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  events:
    MemoryEvent[];
  familyAffinities:
    ReturnType<
      typeof buildFamilyAffinities
    >;
  accordAffinities:
    ReturnType<
      typeof buildAccordAffinities
    >;
}): BottlePrediction[] {
  const familyScore =
    new Map(
      familyAffinities.map(
        (item) => [
          item.id,
          item.score,
        ],
      ),
    );
  const accordScore =
    new Map(
      accordAffinities.map(
        (item) => [
          item.id,
          item.score,
        ],
      ),
    );

  return collection
    .map(
      (item) => {
        const fragrance =
          catalog.find(
            (candidate) =>
              candidate.id ===
              item.fragranceId,
          );

        if (!fragrance) {
          return null;
        }

        const memoryWears =
          events.filter(
            (event) =>
              event.type ===
                "wear-recorded" &&
              event.entity?.id ===
                fragrance.id,
          ).length;
        const recentNeglect =
          clamp(
            item.daysSinceLastWear /
              90 *
              100,
          );
        const lowUsage =
          item.wearCount <=
            1
            ? 85
            : item.wearCount <=
                  3
              ? 62
              : item.wearCount <=
                    7
                ? 38
                : 18;
        const ratingProtection =
          item.personalRating
            ? clamp(
                (item.personalRating -
                  5) *
                  12,
              )
            : 0;
        const favoriteProtection =
          item.favorite
            ? 26
            : 0;
        const retentionRisk =
          clamp(
            recentNeglect *
              0.55 +
              lowUsage *
                0.35 -
              ratingProtection *
                0.15 -
              favoriteProtection,
          );

        const familyAffinity =
          familyScore.get(
            fragrance.family.toLowerCase(),
          ) ??
          35;
        const accordAffinity =
          average(
            (
              fragrance.accords ??
              []
            ).map(
              (accord) =>
                accordScore.get(
                  accord.toLowerCase(),
                ) ??
                25,
            ),
          );
        const repeatWear =
          clamp(
            item.wearCount *
              8 +
              memoryWears *
                6,
          );
        const signaturePotential =
          clamp(
            repeatWear *
              0.4 +
              familyAffinity *
                0.25 +
              accordAffinity *
                0.15 +
              (item.favorite
                ? 100
                : 45) *
                0.2,
          );

        const evidenceCount =
          memoryWears +
          Math.max(
            1,
            item.wearCount,
          );
        const confidence =
          confidenceFromEvidence(
            evidenceCount,
          );

        const status =
          signaturePotential >=
          78 &&
          retentionRisk <=
          35
            ? "signature-candidate"
            : retentionRisk >=
                  72
              ? "at-risk"
              : retentionRisk >=
                    48
                ? "watch"
                : "stable";

        const evidence:
          PredictionEvidence[] = [
          {
            kind:
              "verified",
            label:
              "Wear history",
            detail:
              `${item.wearCount} collection wears and ${memoryWears} memory wear events.`,
            weight: 0.4,
          },
          {
            kind:
              "verified",
            label:
              "Rotation recency",
            detail:
              `${item.daysSinceLastWear} days since last wear.`,
            weight: 0.35,
          },
          {
            kind:
              "calculated",
            label:
              "Family affinity",
            detail:
              `${fragrance.family} affinity is ${familyAffinity}/100.`,
            weight: 0.15,
          },
          {
            kind:
              item.personalRating !==
              undefined
                ? "verified"
                : "unavailable",
            label:
              "Personal rating",
            detail:
              item.personalRating !==
              undefined
                ? `${item.personalRating}/10 personal rating is included.`
                : "No personal rating is stored for this bottle.",
            weight: 0.1,
          },
        ];

        return {
          fragranceId:
            fragrance.id,
          fragranceName:
            fragrance.name,
          brand:
            fragrance.brand,
          retentionRisk,
          signaturePotential,
          confidence,
          horizonDays: 90,
          status,
          explanation:
            status ===
            "signature-candidate"
              ? `${fragrance.name} combines repeat wear with strong learned preference alignment.`
              : status ===
                  "at-risk"
                ? `${fragrance.name} is showing strong neglect signals based on recency and usage.`
                : status ===
                    "watch"
                  ? `${fragrance.name} has moderate retention risk and should be watched over the next rotation cycle.`
                  : `${fragrance.name} currently shows stable ownership signals.`,
          evidence,
        } satisfies BottlePrediction;
      },
    )
    .filter(
      (
        prediction,
      ): prediction is
        BottlePrediction =>
        Boolean(
          prediction,
        ),
    )
    .sort(
      (a, b) =>
        b.signaturePotential -
        a.signaturePotential,
    );
}

function buildAdaptiveRecommendations({
  collection,
  catalog,
  familyAffinities,
  accordAffinities,
  tasteDrift,
}: {
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  familyAffinities:
    ReturnType<
      typeof buildFamilyAffinities
    >;
  accordAffinities:
    ReturnType<
      typeof buildAccordAffinities
    >;
  tasteDrift:
    ReturnType<
      typeof detectTasteDrift
    >;
}): AdaptiveRecommendation[] {
  const ownedIds =
    new Set(
      collection.map(
        (item) =>
          item.fragranceId,
      ),
    );
  const familyScore =
    new Map(
      familyAffinities.map(
        (item) => [
          item.id,
          item.score,
        ],
      ),
    );
  const accordScore =
    new Map(
      accordAffinities.map(
        (item) => [
          item.id,
          item.score,
        ],
      ),
    );
  const rising =
    tasteDrift.filter(
      (item) =>
        item.direction ===
          "rising",
    );

  return catalog
    .filter(
      (fragrance) =>
        !ownedIds.has(
          fragrance.id,
        ),
    )
    .map(
      (fragrance) => {
        const family =
          familyScore.get(
            fragrance.family.toLowerCase(),
          ) ??
          35;
        const matchedAccords =
          (
            fragrance.accords ??
            []
          )
            .map(
              (accord) => ({
                accord,
                score:
                  accordScore.get(
                    accord.toLowerCase(),
                  ) ??
                  0,
              }),
            )
            .filter(
              (item) =>
                item.score >=
                45,
            )
            .sort(
              (a, b) =>
                b.score -
                a.score,
            );
        const accord =
          average(
            matchedAccords.map(
              (item) =>
                item.score,
            ),
          );

        const driftFit =
          rising.length
            ? average(
                rising.map(
                  (signal) =>
                    fragrance.dna[
                      signal.dimension
                    ],
                ),
              )
            : 50;

        const performance =
          average([
            fragrance.performance
              .projection,
            fragrance.performance
              .longevity,
            fragrance.performance
              .consistency ??
              75,
          ]);
        const probability =
          clamp(
            family *
              0.3 +
              accord *
                0.25 +
              driftFit *
                0.25 +
              performance *
                0.2,
          );

        const evidenceCount =
          (
            familyAffinities.find(
              (item) =>
                item.id ===
                fragrance.family.toLowerCase(),
            )
              ?.evidenceCount ??
            0
          ) +
          matchedAccords.reduce(
            (
              sum,
              item,
            ) =>
              sum +
              (
                accordAffinities.find(
                  (affinity) =>
                    affinity.id ===
                    item.accord.toLowerCase(),
                )
                  ?.evidenceCount ??
                0
              ),
            0,
          );

        return {
          fragranceId:
            fragrance.id,
          fragranceName:
            fragrance.name,
          brand:
            fragrance.brand,
          probability,
          confidence:
            confidenceFromEvidence(
              evidenceCount,
            ),
          summary:
            `${fragrance.name} aligns with learned ${fragrance.family} preference${matchedAccords[0] ? ` and ${matchedAccords[0].accord} affinity` : ""}.`,
          matchedFamilies:
            family >=
            45
              ? [
                  fragrance.family,
                ]
              : [],
          matchedAccords:
            matchedAccords
              .slice(
                0,
                3,
              )
              .map(
                (item) =>
                  item.accord,
              ),
          evidence: [
            {
              kind:
                family >=
                45
                  ? "calculated"
                  : "estimated",
              label:
                "Family affinity",
              detail:
                `${fragrance.family}: ${Math.round(
                  family,
                )}/100 learned fit.`,
            },
            {
              kind:
                matchedAccords.length
                  ? "calculated"
                  : "unavailable",
              label:
                "Accord affinity",
              detail:
                matchedAccords.length
                  ? matchedAccords
                      .slice(
                        0,
                        3,
                      )
                      .map(
                        (item) =>
                          `${item.accord} ${item.score}/100`,
                      )
                      .join(
                        " · ",
                      )
                  : "No repeated accord preference has enough evidence yet.",
            },
            {
              kind:
                rising.length
                  ? "calculated"
                  : "unavailable",
              label:
                "Taste drift",
              detail:
                rising.length
                  ? `Compared against ${rising
                      .slice(
                        0,
                        2,
                      )
                      .map(
                        (item) =>
                          `${item.dimension} ${item.delta > 0 ? "+" : ""}${item.delta}`,
                      )
                      .join(
                        ", ",
                      )}.`
                  : "Not enough longitudinal wear evidence for drift adjustment.",
            },
          ],
        } satisfies AdaptiveRecommendation;
      },
    )
    .filter(
      (recommendation) =>
        recommendation.probability >=
        50,
    )
    .sort(
      (a, b) =>
        b.probability -
        a.probability,
    )
    .slice(
      0,
      8,
    );
}

function confidenceFromEvidence(
  count: number,
) {
  if (
    count <=
    0
  ) {
    return 42;
  }

  return Math.min(
    96,
    Math.round(
      48 +
        Math.sqrt(
          count,
        ) *
          14,
    ),
  );
}

function average(
  values: number[],
) {
  if (!values.length) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
    values.length
  );
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        Number.isFinite(
          value,
        )
          ? value
          : 0,
      ),
    ),
  );
}
