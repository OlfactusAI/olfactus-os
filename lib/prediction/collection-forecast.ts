import type {
  CollectionItem,
  CollectorProfile,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  analyzeCollectionHealth,
} from "@/lib/intelligence/collection-health";
import type {
  MemoryEvent,
} from "@/lib/memory/types";
import {
  buildPredictiveSnapshot,
} from "@/lib/predictive/prediction-engine";
import {
  forecastBottleStates,
} from "@/lib/prediction/forecast-bottles";
import {
  forecastConfidence,
  forecastUncertainty,
} from "@/lib/prediction/forecast-confidence";
import {
  forecastDnaBalance,
} from "@/lib/prediction/forecast-dna";
import {
  buildForecastDrivers,
} from "@/lib/prediction/forecast-drivers";
import {
  buildForecastMilestones,
} from "@/lib/prediction/forecast-milestones";
import {
  forecastRoleCoverage,
} from "@/lib/prediction/forecast-roles";
import type {
  CollectionForecast,
  CollectionForecastHorizon,
  CollectionForecastPoint,
} from "@/lib/prediction/prediction-types";

const horizons:
  Array<{
    horizon:
      CollectionForecastHorizon;
    label: string;
    days: number;
  }> = [
    {
      horizon: "now",
      label: "Now",
      days: 0,
    },
    {
      horizon: "30d",
      label: "30 days",
      days: 30,
    },
    {
      horizon: "90d",
      label: "90 days",
      days: 90,
    },
    {
      horizon: "6m",
      label: "6 months",
      days: 180,
    },
    {
      horizon: "1y",
      label: "1 year",
      days: 365,
    },
  ];

export function forecastCollection({
  collection,
  catalog,
  profile,
  events,
}: {
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  profile:
    CollectorProfile;
  events:
    MemoryEvent[];
}): CollectionForecast {
  const currentAnalysis =
    analyzeCollectionHealth({
      collection,
      catalog,
      profile,
    });
  const predictiveSnapshot =
    buildPredictiveSnapshot({
      collection,
      catalog,
      events,
    });

  const points =
    horizons.map(
      ({
        horizon,
        label,
        days,
      }) =>
        buildForecastPoint({
          horizon,
          label,
          days,
          collection,
          catalog,
          profile,
          events,
          currentAnalysis,
          predictiveSnapshot,
        }),
    );

  const futurePoints =
    points.filter(
      (point) =>
        point.days >
        0,
    );

  const strongestFutureSignal =
    futurePoints
      .flatMap(
        (point) =>
          point.drivers.map(
            (driver) => ({
              point,
              driver,
            }),
          ),
      )
      .sort(
        (a, b) =>
          Math.abs(
            b.driver.impact,
          ) -
          Math.abs(
            a.driver.impact,
          ),
      )[0];

  const roleGap =
    futurePoints
      .flatMap(
        (point) =>
          point.roles.map(
            (role) => ({
              point,
              role,
            }),
          ),
      )
      .find(
        ({
          role,
        }) =>
          role.status ===
          "likely-gap",
      );

  return {
    modelVersion:
      "CF-3.2.0-alpha.1",
    currentHealth:
      currentAnalysis.score,
    overallConfidence:
      predictiveSnapshot.confidence,
    evidenceEvents:
      predictiveSnapshot
        .evidenceEvents,
    points,
    strongestFutureSignal:
      strongestFutureSignal
        ? `${strongestFutureSignal.driver.title} by ${strongestFutureSignal.point.label.toLowerCase()}`
        : undefined,
    nextLikelyRoleGap:
      roleGap
        ? `${roleGap.role.role} · ${roleGap.point.label}`
        : undefined,
  };
}

function buildForecastPoint({
  horizon,
  label,
  days,
  collection,
  catalog,
  profile,
  events,
  currentAnalysis,
  predictiveSnapshot,
}: {
  horizon:
    CollectionForecastHorizon;
  label: string;
  days: number;
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  profile:
    CollectorProfile;
  events:
    MemoryEvent[];
  currentAnalysis:
    ReturnType<
      typeof analyzeCollectionHealth
    >;
  predictiveSnapshot:
    ReturnType<
      typeof buildPredictiveSnapshot
    >;
}): CollectionForecastPoint {
  const projectedCollection =
    projectCollectionItems({
      collection,
      catalog,
      events,
      days,
    });

  const confidence =
    days ===
    0
      ? Math.max(
          90,
          currentAnalysis
            .confidence,
        )
      : forecastConfidence({
          baseConfidence:
            predictiveSnapshot.confidence,
          evidenceEvents:
            predictiveSnapshot
              .evidenceEvents,
          collectionSize:
            collection.length,
          horizonDays:
            days,
        });

  const bottleStates =
    forecastBottleStates({
      projectedCollection,
      catalog,
      events,
      predictiveSnapshot,
      horizonDays:
        days,
    });

  const activeIds =
    new Set(
      bottleStates
        .filter(
          (bottle) =>
            ![
              "neglect-risk",
              "removal-candidate",
              "archive",
            ].includes(
              bottle.state,
            ),
        )
        .map(
          (bottle) =>
            bottle.fragranceId,
        ),
    );

  const effectiveCollection =
    days ===
    0
      ? projectedCollection
      : projectedCollection.filter(
          (item) =>
            activeIds.has(
              item.fragranceId,
            ),
        );

  const projectedAnalysis =
    analyzeCollectionHealth({
      collection:
        effectiveCollection.length
          ? effectiveCollection
          : projectedCollection,
      catalog,
      profile,
    });

  const uncertainty =
    days ===
    0
      ? 1
      : forecastUncertainty({
          confidence,
          horizonDays:
            days,
        });

  const dna =
    forecastDnaBalance({
      collection:
        effectiveCollection.length
          ? effectiveCollection
          : projectedCollection,
      catalog,
      bottleStates,
    });
  const roles =
    forecastRoleCoverage({
      catalog,
      bottleStates,
      confidence,
    });

  const neglectedCount =
    bottleStates.filter(
      (bottle) =>
        bottle.state ===
          "neglect-risk" ||
        bottle.state ===
          "removal-candidate" ||
        bottle.state ===
          "archive",
    ).length;

  const activeRotation =
    Math.max(
      0,
      bottleStates.length -
        neglectedCount,
    );

  const signatureBottles =
    bottleStates
      .filter(
        (bottle) =>
          [
            "core-rotation",
            "signature-candidate",
            "emerging-favorite",
            "stable",
          ].includes(
            bottle.state,
          ),
      )
      .sort(
        (a, b) =>
          b.signaturePotential -
          a.signaturePotential,
      )
      .slice(
        0,
        4,
      );

  const signatureStability =
    clamp(
      average(
        signatureBottles.map(
          (bottle) =>
            bottle.signaturePotential,
        ),
      ) -
        Math.max(
          0,
          4 -
            signatureBottles.length,
        ) *
          5,
    );

  const inactivityPenalty =
    bottleStates.length
      ? neglectedCount /
          bottleStates.length *
          18
      : 0;

  const watchPenalty =
    bottleStates.filter(
      (bottle) =>
        bottle.state ===
        "watch",
    ).length *
    1.5;

  const signatureSupport =
    Math.max(
      -4,
      Math.min(
        5,
        (
          signatureStability -
          55
        ) *
          0.08,
      ),
    );

  const horizonBehaviorPenalty =
    days ===
    0
      ? 0
      : days <= 30
        ? 0.5
        : days <= 90
          ? 1.5
          : days <= 180
            ? 3
            : 5;

  const center =
    clamp(
      projectedAnalysis.score -
        inactivityPenalty -
        watchPenalty -
        horizonBehaviorPenalty +
        signatureSupport,
    );

  const drivers =
    buildForecastDrivers({
      current:
        currentAnalysis,
      projected:
        projectedAnalysis,
      bottles:
        bottleStates,
      dna,
      roles,
    });

const low =
    clamp(
      center -
        uncertainty,
    );
  const high =
    clamp(
      center +
        uncertainty,
    );

  const milestones =
    buildForecastMilestones({
      bottles:
        bottleStates,
      roles,
      health:
        center,
      confidence,
    });

  return {
    horizon,
    label,
    days,
    confidence,
    health: {
      center,
      low,
      high,
      trend:
        center >=
        currentAnalysis.score +
          3
          ? "improving"
          : center <=
                currentAnalysis.score -
                  3
            ? "declining"
            : "stable",
    },
    rotation:
      projectedAnalysis
        .dimensions.rotation,
    diversity:
      projectedAnalysis
        .dimensions.diversity,
    redundancy:
      projectedAnalysis
        .dimensions.redundancy,
    seasonalBalance:
      projectedAnalysis
        .dimensions
        .seasonalBalance,
    activeRotation,
    neglectedCount,
    signatureStability,
    bottleStates,
    dna,
    roles,
    milestones,
    drivers,
  };
}

function projectCollectionItems({
  collection,
  events,
  days,
}: {
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  events:
    MemoryEvent[];
  days: number;
}) {
  if (
    days ===
    0
  ) {
    return collection;
  }

  const memoryWears =
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

    memoryWears.set(
      event.entity.id,
      (
        memoryWears.get(
          event.entity.id,
        ) ??
        0
      ) + 1,
    );
  }

  const totalWears =
    Math.max(
      1,
      collection.reduce(
        (sum, item) =>
          sum +
          item.wearCount,
        0,
      ),
    );

  return collection.map(
    (item) => {
      const share =
        item.wearCount /
        totalWears;
      const memoryCount =
        memoryWears.get(
          item.fragranceId,
        ) ??
        0;

      const engagement =
        Math.max(
          0,
          Math.min(
            100,
            share *
              collection.length *
              34 +
              Math.min(
                28,
                item.wearCount *
                  3.2,
              ) +
              Math.min(
                16,
                memoryCount *
                  2.4,
              ) +
              (
                item.favorite
                  ? 16
                  : 0
              ) -
              Math.min(
                28,
                item.daysSinceLastWear *
                  0.5,
              ),
          ),
        );

      const horizonDecay =
        days <= 30
          ? 0.98
          : days <= 90
            ? 0.88
            : days <= 180
              ? 0.74
              : 0.56;

      const monthlyRate =
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
        );

      const expectedWears =
        monthlyRate *
        days /
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
                    days *
                      0.08,
                ),
              )
            : Math.round(
                item.daysSinceLastWear +
                  days *
                    (
                      monthlyRate <=
                      0.25
                        ? 0.82
                        : 0.52
                    ),
              );

      return {
        ...item,
        wearCount:
          item.wearCount +
          Math.round(
            expectedWears,
          ),
        daysSinceLastWear:
          projectedDays,
      };
    },
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
      Math.round(value),
    ),
  );
}
