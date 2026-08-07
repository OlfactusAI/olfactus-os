import type {
  CanonicalCollectorState,
} from "@/lib/collector-state/types";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  embedFragrance,
} from "@/lib/embedding/fragrance-embedding";
import type {
  CollectorPreferenceEmbedding,
  PreferenceDimension,
  PreferenceEmbedding,
} from "@/lib/embedding/types";

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

export function buildCollectorPreferenceEmbedding({
  state,
  catalog,
}: {
  state:
    CanonicalCollectorState;
  catalog:
    FragranceRecord[];
}): CollectorPreferenceEmbedding {
  const byId =
    new Map(
      catalog.map(
        (fragrance) => [
          fragrance.id,
          fragrance,
        ],
      ),
    );

  const totals =
    Object.fromEntries(
      dimensions.map(
        (dimension) => [
          dimension,
          0,
        ],
      ),
    ) as PreferenceEmbedding;

  let totalWeight =
    0;

  for (
    const ownership
    of state.ownership
  ) {
    const fragrance =
      byId.get(
        ownership.fragranceId,
      );

    if (!fragrance) {
      continue;
    }

    const embedding =
      embedFragrance(
        fragrance,
      );

    const weight =
      1 +
      Math.min(
        8,
        ownership.wearCount *
          0.45,
      ) +
      Math.min(
        4,
        ownership.memoryWearCount *
          0.5,
      ) +
      (
        ownership.favorite
          ? 4
          : 0
      ) +
      (
        ownership.personalRating
          ? Math.max(
              0,
              ownership.personalRating -
                5,
            ) *
              0.8
          : 0
      ) -
      Math.min(
        2.5,
        ownership.daysSinceLastWear /
          100,
      );

    const safeWeight =
      Math.max(
        0.5,
        weight,
      );

    totalWeight +=
      safeWeight;

    for (
      const dimension
      of dimensions
    ) {
      totals[
        dimension
      ] +=
        embedding[
          dimension
        ] *
        safeWeight;
    }
  }

  const dimensionsOutput =
    Object.fromEntries(
      dimensions.map(
        (dimension) => [
          dimension,
          totalWeight
            ? Math.round(
                totals[
                  dimension
                ] /
                  totalWeight,
              )
            : 50,
        ],
      ),
    ) as PreferenceEmbedding;

  const strongestDimensions =
    dimensions
      .map(
        (dimension) => ({
          dimension,
          score:
            dimensionsOutput[
              dimension
            ],
        }),
      )
      .sort(
        (a, b) =>
          b.score -
          a.score,
      )
      .slice(
        0,
        7,
      );

  const evidence = [
    `${state.ownership.length} owned fragrances`,
    `${state.behavior.eventState.totalEvents} memory events`,
    `${state.ownership.reduce(
      (sum, item) =>
        sum +
        item.wearCount,
      0,
    )} recorded collection wears`,
    `${state.ownership.filter(
      (item) =>
        item.favorite,
    ).length} favorites`,
  ];

  return {
    modelVersion:
      "PEM-1.0.0",
    generatedAt:
      state.generatedAt,
    confidence:
      Math.max(
        35,
        Math.min(
          96,
          Math.round(
            state.confidence
              .overall *
              0.7 +
              Math.min(
                30,
                state.ownership
                  .length *
                  2.5,
              ),
          ),
        ),
      ),
    dimensions:
      dimensionsOutput,
    strongestDimensions,
    evidence,
  };
}
