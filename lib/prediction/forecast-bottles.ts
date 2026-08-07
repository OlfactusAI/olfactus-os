import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  MemoryEvent,
} from "@/lib/memory/types";
import type {
  PredictiveSnapshot,
} from "@/lib/predictive/types";
import type {
  BottleFutureForecast,
} from "@/lib/prediction/prediction-types";

export function forecastBottleStates({
  projectedCollection,
  catalog,
  events,
  predictiveSnapshot,
  horizonDays,
}: {
  projectedCollection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  events:
    MemoryEvent[];
  predictiveSnapshot:
    PredictiveSnapshot;
  horizonDays: number;
}): BottleFutureForecast[] {
  const predictiveById =
    new Map(
      predictiveSnapshot
        .bottlePredictions
        .map(
          (prediction) => [
            prediction.fragranceId,
            prediction,
          ],
        ),
    );

  const memoryWearCounts =
    new Map<
      string,
      number
    >();

  for (const event of events) {
    if (
      event.type !==
        "wear-recorded" ||
      event.entity?.type !==
        "fragrance"
    ) {
      continue;
    }

    memoryWearCounts.set(
      event.entity.id,
      (
        memoryWearCounts.get(
          event.entity.id,
        ) ??
        0
      ) + 1,
    );
  }

  const totalWears =
    Math.max(
      1,
      projectedCollection.reduce(
        (sum, item) =>
          sum +
          item.wearCount,
        0,
      ),
    );

  const stableCollection =
    dedupeCollection(
      projectedCollection,
    );

  return stableCollection
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

        const prediction =
          predictiveById.get(
            fragrance.id,
          );
        const memoryWears =
          memoryWearCounts.get(
            fragrance.id,
          ) ??
          0;

        const relativeUsage =
          item.wearCount /
          totalWears;

        const engagement =
          clamp(
            relativeUsage *
              projectedCollection.length *
              34 +
              Math.min(
                28,
                item.wearCount *
                  3.2,
              ) +
              Math.min(
                16,
                memoryWears *
                  2.4,
              ) +
              (
                item.favorite
                  ? 16
                  : 0
              ) +
              (
                item.personalRating !==
                  undefined
                  ? Math.max(
                      0,
                      item.personalRating -
                        6,
                    ) *
                      4
                  : 0
              ) -
              Math.min(
                28,
                item.daysSinceLastWear *
                  0.5,
              ),
          );

        const horizonDecay =
          horizonDays <= 30
            ? 0.98
            : horizonDays <= 90
              ? 0.88
              : horizonDays <= 180
                ? 0.74
                : 0.56;

        const monthlyRate =
          roundOne(
            Math.max(
              0.08,
              Math.min(
                7,
                (
                  0.12 +
                  engagement /
                    24
                ) *
                  horizonDecay,
              ),
            ),
          );

        const expectedWears =
          monthlyRate *
          horizonDays /
          30;

        const projectedDays =
          monthlyRate >=
            1.25
            ? Math.max(
                0,
                Math.round(
                  30 /
                    monthlyRate *
                    0.82,
                ),
              )
            : monthlyRate >=
                0.65
              ? Math.round(
                  Math.max(
                    item.daysSinceLastWear,
                    34 +
                      horizonDays *
                        0.08,
                  ),
                )
              : Math.round(
                  item.daysSinceLastWear +
                    horizonDays *
                      (
                        monthlyRate <=
                        0.25
                          ? 0.82
                          : 0.52
                      ),
                );

        const retentionRisk =
          clamp(
            (
              prediction
                ?.retentionRisk ??
              45
            ) *
              0.45 +
              Math.min(
                100,
                projectedDays *
                  1.2,
              ) *
                0.38 +
              Math.max(
                0,
                1.1 -
                  monthlyRate,
              ) *
                18 -
              (
                item.favorite
                  ? 10
                  : 0
              ),
          );
        const signaturePotential =
          clamp(
            (
              prediction
                ?.signaturePotential ??
              35
            ) *
              0.72 +
              Math.min(
                100,
                monthlyRate *
                  22,
              ) *
                0.28,
          );

        const state =
          classifyBottleState({
            item,
            fragrance,
            projectedDays,
            monthlyRate,
            retentionRisk,
            signaturePotential,
          });

        return {
          fragranceId:
            fragrance.id,
          fragranceName:
            fragrance.name,
          brand:
            fragrance.brand,
          state,
          confidence:
            Math.min(
              96,
              Math.max(
                45,
                prediction
                  ?.confidence ??
                  55,
              ),
            ),
          projectedDaysSinceLastWear:
            projectedDays,
          estimatedWearsPerMonth:
            monthlyRate,
          retentionRisk,
          signaturePotential,
          reason:
            reasonForState({
              state,
              projectedDays,
              monthlyRate,
              retentionRisk,
              signaturePotential,
            }),
        } satisfies BottleFutureForecast;
      },
    )
    .filter(
      (
        item,
      ): item is
        BottleFutureForecast =>
        Boolean(item),
    )
    .sort(
      (a, b) =>
        priority(
          a.state,
        ) -
        priority(
          b.state,
        ) ||
        b.signaturePotential -
          a.signaturePotential,
    );
}

function classifyBottleState({
  item,
  fragrance,
  projectedDays,
  monthlyRate,
  retentionRisk,
  signaturePotential,
}: {
  item:
    CollectionItem;
  fragrance:
    FragranceRecord;
  projectedDays: number;
  monthlyRate: number;
  retentionRisk: number;
  signaturePotential: number;
}): BottleFutureForecast["state"] {
  if (
    item.fillLevelPercent !==
      undefined &&
    item.fillLevelPercent <=
      15 &&
    signaturePotential >=
      72
  ) {
    return "likely-repurchase";
  }

  if (
    item.fillLevelPercent !==
      undefined &&
    item.fillLevelPercent <=
      12 &&
    retentionRisk >=
      68
  ) {
    return "archive";
  }

  if (
    retentionRisk >=
      76 &&
    projectedDays >=
      82
  ) {
    return "removal-candidate";
  }

  const seasonValues =
    Object.values(
      fragrance.seasons,
    );
  const seasonalSpread =
    Math.max(
      ...seasonValues,
    ) -
    Math.min(
      ...seasonValues,
    );

  if (
    projectedDays >=
      55 &&
    seasonalSpread >=
      48 &&
    retentionRisk <
      72
  ) {
    return "seasonal-hold";
  }

  if (
    signaturePotential >=
      80 &&
    retentionRisk <=
      40
  ) {
    return "signature-candidate";
  }

  if (
    signaturePotential >=
      66 &&
    monthlyRate >=
      2
  ) {
    return "emerging-favorite";
  }

  if (
    retentionRisk >=
      64 ||
    projectedDays >=
      62
  ) {
    return "neglect-risk";
  }

  if (
    retentionRisk >=
      44 ||
    projectedDays >=
      38
  ) {
    return "watch";
  }

  if (
    monthlyRate >=
      2.6 &&
    projectedDays <=
      28
  ) {
    return "core-rotation";
  }

  return "stable";
}

function reasonForState({
  state,
  projectedDays,
  monthlyRate,
  retentionRisk,
  signaturePotential,
}: {
  state:
    BottleFutureForecast["state"];
  projectedDays: number;
  monthlyRate: number;
  retentionRisk: number;
  signaturePotential: number;
}) {
  switch (
    state
  ) {
    case "signature-candidate":
      return `Repeat-use trajectory and preference fit support ${signaturePotential}% signature potential.`;
    case "emerging-favorite":
      return `Projected use remains strong at ${monthlyRate} wears/month with rising signature potential.`;
    case "removal-candidate":
      return `Projected inactivity reaches ${projectedDays} days with ${retentionRisk}% retention risk.`;
    case "neglect-risk":
      return `Rotation inactivity is projected to reach ${projectedDays} days.`;
    case "seasonal-hold":
      return "Low near-term activity is consistent with a strongly seasonal scent profile.";
    case "core-rotation":
      return `Projected use remains high at ${monthlyRate} wears/month.`;
    case "likely-repurchase":
      return "Low fill level combines with strong projected continued use.";
    case "archive":
      return "Low fill level combines with weak future retention signals.";
    case "watch":
      return "Moderate inactivity or retention risk warrants monitoring.";
    default:
      return "No strong future risk or signature signal is currently dominant.";
  }
}

function priority(
  state:
    BottleFutureForecast["state"],
) {
  const order:
    Record<
      BottleFutureForecast["state"],
      number
    > = {
    "removal-candidate": 0,
    "neglect-risk": 1,
    watch: 2,
    "signature-candidate": 3,
    "emerging-favorite": 4,
    "core-rotation": 5,
    "seasonal-hold": 6,
    stable: 7,
    "likely-repurchase": 8,
    archive: 9,
  };

  return order[state];
}

function dedupeCollection(
  collection:
    CollectionItem[],
) {
  const byId =
    new Map<
      string,
      CollectionItem
    >();

  for (const item of collection) {
    const existing =
      byId.get(
        item.fragranceId,
      );

    if (!existing) {
      byId.set(
        item.fragranceId,
        item,
      );
      continue;
    }

    // Preserve one canonical owned-bottle record. If duplicate records ever
    // reach prediction, prefer the richer activity state rather than allowing
    // the forecast UI to invent an extra future bottle.
    byId.set(
      item.fragranceId,
      {
        ...existing,
        ...item,
        wearCount:
          Math.max(
            existing.wearCount,
            item.wearCount,
          ),
        daysSinceLastWear:
          Math.min(
            existing.daysSinceLastWear,
            item.daysSinceLastWear,
          ),
        favorite:
          existing.favorite ||
          item.favorite,
      },
    );
  }

  return [
    ...byId.values(),
  ];
}

function roundOne(
  value: number,
) {
  return (
    Math.round(
      value * 10,
    ) / 10
  );
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
