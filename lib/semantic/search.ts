import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  embedFragrance,
} from "@/lib/embedding/fragrance-embedding";
import type {
  CollectorPreferenceEmbedding,
  PreferenceDimension,
} from "@/lib/embedding/types";
import type {
  InterpretedFragranceRequest,
} from "@/lib/language/types";

const dimensions:
  PreferenceDimension[] = [
    "freshness",
    "sweetness",
    "darkness",
    "dryness",
    "warmth",
    "density",
    "airiness",
    "projection",
    "formality",
    "novelty",
    "familiarity",
    "creaminess",
    "smokiness",
    "greenness",
    "fruitiness",
    "floral",
    "mineral",
    "cleanliness",
    "woodiness",
    "amber",
    "complexity",
  ];

export interface SemanticCandidate {
  fragrance:
    FragranceRecord;
  semanticScore: number;
  preferenceScore: number;
  constraintScore: number;
  referenceScore: number;
  matchedDimensions:
    Array<{
      dimension:
        PreferenceDimension;
      value: number;
      target: number;
      delta: number;
    }>;
  explanation: string[];
}

export function findSemanticCandidates({
  request,
  collectorEmbedding,
  catalog,
  ownedIds,
  limit = 20,
}: {
  request:
    InterpretedFragranceRequest;
  collectorEmbedding:
    CollectorPreferenceEmbedding;
  catalog:
    FragranceRecord[];
  ownedIds?:
    Set<string>;
  limit?: number;
}): SemanticCandidate[] {
  const references =
    request.referenceFragranceIds
      .map(
        (id) =>
          catalog.find(
            (item) =>
              item.id === id,
          ),
      )
      .filter(
        (
          item,
        ): item is
          FragranceRecord =>
          Boolean(item),
      );

  return catalog
    .filter(
      (fragrance) =>
        !ownedIds?.has(
          fragrance.id,
        ) &&
        !request
          .excludedFragranceIds
          .includes(
            fragrance.id,
          ),
    )
    .map(
      (fragrance) => {
        const embedding =
          embedFragrance(
            fragrance,
          );

        const preferenceDistance =
          dimensions.reduce(
            (sum, dimension) =>
              sum +
              Math.abs(
                embedding[
                  dimension
                ] -
                  collectorEmbedding
                    .dimensions[
                    dimension
                  ],
              ),
            0,
          ) /
          dimensions.length;

        const preferenceScore =
          clamp(
            100 -
              preferenceDistance,
          );

        const matches =
          request
            .weightedDimensions.map(
              (constraint) => {
                const value =
                  embedding[
                    constraint.dimension
                  ];
                const delta =
                  Math.abs(
                    value -
                      constraint.target,
                  );
                const directionalPenalty =
                  constraint.direction ===
                    "minimum" &&
                  value <
                    constraint.target
                    ? (
                        constraint.target -
                        value
                      ) *
                      1.5
                    : constraint.direction ===
                          "maximum" &&
                        value >
                          constraint.target
                      ? (
                          value -
                          constraint.target
                        ) *
                        1.5
                      : delta *
                        0.55;

                return {
                  dimension:
                    constraint.dimension,
                  value,
                  target:
                    Math.round(
                      constraint.target,
                    ),
                  delta:
                    Math.round(
                      directionalPenalty,
                    ),
                  weightedPenalty:
                    directionalPenalty *
                    constraint.weight,
                };
              },
            );

        const constraintPenalty =
          matches.length
            ? matches.reduce(
                (sum, item) =>
                  sum +
                  item.weightedPenalty,
                0,
              ) /
              matches.length
            : 22;

        const constraintScore =
          clamp(
            100 -
              constraintPenalty,
          );

        const referenceScore =
          references.length
            ? average(
                references.map(
                  (reference) =>
                    relativeReferenceFit({
                      candidate:
                        embedding,
                      reference:
                        embedFragrance(
                          reference,
                        ),
                      request,
                    }),
                ),
              )
            : 70;

        const semanticScore =
          clamp(
            constraintScore *
              0.52 +
            preferenceScore *
              0.28 +
            referenceScore *
              0.2,
          );

        const explanation =
          matches
            .slice()
            .sort(
              (a, b) =>
                a.delta -
                b.delta,
            )
            .slice(
              0,
              4,
            )
            .map(
              (match) =>
                `${match.dimension}: ${match.value} vs target ${match.target}`,
            );

        return {
          fragrance,
          semanticScore,
          preferenceScore,
          constraintScore,
          referenceScore,
          matchedDimensions:
            matches
              .slice()
              .sort(
                (a, b) =>
                  a.delta -
                  b.delta,
              )
              .slice(
                0,
                6,
              )
              .map(
                ({
                  dimension,
                  value,
                  target,
                  delta,
                }) => ({
                  dimension,
                  value,
                  target,
                  delta,
                }),
              ),
          explanation,
        };
      },
    )
    .sort(
      (a, b) =>
        b.semanticScore -
          a.semanticScore ||
        b.constraintScore -
          a.constraintScore ||
        a.fragrance.name.localeCompare(
          b.fragrance.name,
        ),
    )
    .slice(
      0,
      limit,
    );
}

function relativeReferenceFit({
  candidate,
  reference,
  request,
}: {
  candidate:
    ReturnType<
      typeof embedFragrance
    >;
  reference:
    ReturnType<
      typeof embedFragrance
    >;
  request:
    InterpretedFragranceRequest;
}) {
  const applicable =
    request.constraints.filter(
      (constraint) =>
        constraint.referenceFragranceId,
    );

  if (!applicable.length) {
    return 70;
  }

  const scores =
    applicable.map(
      (constraint) => {
        const candidateValue =
          candidate[
            constraint.dimension
          ];
        const referenceValue =
          reference[
            constraint.dimension
          ];

        if (
          constraint.operator ===
          "less"
        ) {
          return candidateValue <
            referenceValue
            ? 92
            : clamp(
                72 -
                  (
                    candidateValue -
                    referenceValue
                  ) *
                    2,
              );
        }

        if (
          constraint.operator ===
          "more"
        ) {
          return candidateValue >
            referenceValue
            ? 92
            : clamp(
                72 -
                  (
                    referenceValue -
                    candidateValue
                  ) *
                    2,
              );
        }

        return 70;
      },
    );

  return average(
    scores,
  );
}

function average(
  values: number[],
) {
  if (!values.length) {
    return 0;
  }

  return values.reduce(
    (sum, value) =>
      sum + value,
    0,
  ) / values.length;
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}
