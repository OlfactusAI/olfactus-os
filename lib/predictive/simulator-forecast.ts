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
  SimulationScenarioResult,
} from "@/lib/intelligence/multi-step-simulator";
import type {
  MemoryEvent,
} from "@/lib/memory/types";
import {
  buildPredictiveSnapshot,
} from "@/lib/predictive/prediction-engine";

export type ForecastHorizonDays =
  | 90
  | 180
  | 365;

export interface PredictiveSimulationForecast {
  horizonDays:
    ForecastHorizonDays;
  confidence: number;
  evidenceEvents: number;
  health: {
    current: number;
    immediate: number;
    forecast: number;
    low: number;
    high: number;
    trend:
      | "improving"
      | "stable"
      | "declining";
  };
  projectedActiveRotation: number;
  projectedNeglected: number;
  projectedHighRisk: number;
  candidateForecasts:
    PredictiveCandidateForecast[];
  dominantOutcome:
    | "durable-improvement"
    | "balanced-change"
    | "temporary-excitement"
    | "redundancy-risk"
    | "rotation-risk";
  verdict: string;
  reasons: string[];
  limitations: string[];
}

export interface PredictiveCandidateForecast {
  fragranceId: string;
  fragranceName: string;
  brand: string;
  action:
    | "add"
    | "remove"
    | "replace";
  estimatedWearsPerMonth?: number;
  retentionProbability?: number;
  neglectProbability?: number;
  signaturePotential?: number;
  learnedFit?: number;
  confidence: number;
}

export function forecastSimulationScenario({
  scenario,
  currentCollection,
  catalog,
  profile,
  events,
  horizonDays,
}: {
  scenario:
    SimulationScenarioResult;
  currentCollection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  profile:
    CollectorProfile;
  events:
    MemoryEvent[];
  horizonDays:
    ForecastHorizonDays;
}): PredictiveSimulationForecast {
  const currentHealth =
    analyzeCollectionHealth({
      collection:
        currentCollection,
      catalog,
      profile,
    });
  const immediateHealth =
    analyzeCollectionHealth({
      collection:
        scenario.projectedCollection,
      catalog,
      profile,
    });

  const currentPrediction =
    buildPredictiveSnapshot({
      collection:
        currentCollection,
      catalog,
      events,
    });
  const projectedPrediction =
    buildPredictiveSnapshot({
      collection:
        scenario.projectedCollection,
      catalog,
      events,
    });

  const horizonFactor =
    horizonDays /
    180;

  const redundancyPressure =
    Math.max(
      0,
      immediateHealth
        .dimensions
        .redundancy -
        currentHealth
          .dimensions
          .redundancy,
    );
  const diversityBenefit =
    immediateHealth
      .dimensions
      .diversity -
    currentHealth
      .dimensions
      .diversity;
  const roleBenefit =
    immediateHealth
      .dimensions
      .roleCoverage -
    currentHealth
      .dimensions
      .roleCoverage;

  const candidateForecasts =
    buildCandidateForecasts({
      scenario,
      currentCollection,
      catalog,
      projectedPrediction,
      currentPrediction,
      horizonDays,
    });

  const meanNeglectRisk =
    average(
      projectedPrediction
        .bottlePredictions
        .map(
          (item) =>
            item.retentionRisk,
        ),
    );
  const candidateNeglect =
    average(
      candidateForecasts
        .map(
          (item) =>
            item.neglectProbability ??
            0,
        ),
    );

  const behaviorPressure =
    (
      meanNeglectRisk *
        0.055 +
      candidateNeglect *
        0.035
    ) *
    horizonFactor;

  const structuralAdjustment =
    (
      diversityBenefit *
        0.08 +
      roleBenefit *
        0.07 -
      redundancyPressure *
        0.1
    ) *
    Math.min(
      1.35,
      horizonFactor,
    );

  const forecastCenter =
    clamp(
      immediateHealth.score +
        structuralAdjustment -
        behaviorPressure +
        3.5 *
          Math.min(
            1,
            horizonFactor,
          ),
    );

  const confidence =
    buildForecastConfidence({
      predictiveConfidence:
        projectedPrediction.confidence,
      evidenceEvents:
        projectedPrediction
          .evidenceEvents,
      collectionSize:
        scenario
          .projectedCollection
          .length,
      scenarioSteps:
        scenario.steps.length,
      horizonDays,
    });

  const uncertainty =
    Math.round(
      4 +
        (100 -
          confidence) *
          0.11 +
        horizonFactor *
          2,
    );

  const forecastLow =
    clamp(
      forecastCenter -
        uncertainty,
    );
  const forecastHigh =
    clamp(
      forecastCenter +
        uncertainty,
    );

  const projectedHighRisk =
    projectedPrediction
      .bottlePredictions
      .filter(
        (prediction) =>
          prediction
            .retentionRisk >=
          70,
      ).length;

  const projectedNeglected =
    estimateNeglectedCount({
      projectedCollection:
        scenario.projectedCollection,
      predictions:
        projectedPrediction
          .bottlePredictions,
      candidateForecasts,
      horizonDays,
    });

  const projectedActiveRotation =
    Math.max(
      0,
      scenario
        .projectedCollection
        .length -
        projectedNeglected,
    );

  const outcome =
    classifyOutcome({
      immediateHealthDelta:
        immediateHealth.score -
        currentHealth.score,
      forecastHealthDelta:
        forecastCenter -
        currentHealth.score,
      redundancyDelta:
        immediateHealth
          .dimensions
          .redundancy -
        currentHealth
          .dimensions
          .redundancy,
      projectedNeglected,
      projectedSize:
        scenario
          .projectedCollection
          .length,
      candidateForecasts,
    });

  const reasons =
    buildReasons({
      currentHealth:
        currentHealth.score,
      immediateHealth:
        immediateHealth.score,
      forecastHealth:
        forecastCenter,
      diversityBenefit,
      roleBenefit,
      redundancyPressure,
      candidateForecasts,
      projectedNeglected,
      projectedSize:
        scenario
          .projectedCollection
          .length,
    });

  return {
    horizonDays,
    confidence,
    evidenceEvents:
      projectedPrediction
        .evidenceEvents,
    health: {
      current:
        currentHealth.score,
      immediate:
        immediateHealth.score,
      forecast:
        forecastCenter,
      low:
        forecastLow,
      high:
        forecastHigh,
      trend:
        forecastCenter >=
        currentHealth.score +
          3
          ? "improving"
          : forecastCenter <=
                currentHealth.score -
                  3
            ? "declining"
            : "stable",
    },
    projectedActiveRotation,
    projectedNeglected,
    projectedHighRisk,
    candidateForecasts,
    dominantOutcome:
      outcome,
    verdict:
      verdictFor(
        outcome,
      ),
    reasons,
    limitations:
      buildLimitations({
        events,
        confidence,
        horizonDays,
      }),
  };
}

function buildCandidateForecasts({
  scenario,
  currentCollection,
  catalog,
  projectedPrediction,
  currentPrediction,
  horizonDays,
}: {
  scenario:
    SimulationScenarioResult;
  currentCollection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  projectedPrediction:
    ReturnType<
      typeof buildPredictiveSnapshot
    >;
  currentPrediction:
    ReturnType<
      typeof buildPredictiveSnapshot
    >;
  horizonDays:
    ForecastHorizonDays;
}) {
  const currentIds =
    new Set(
      currentCollection.map(
        (item) =>
          item.fragranceId,
      ),
    );
  const forecastById =
    new Map(
      projectedPrediction
        .bottlePredictions
        .map(
          (prediction) => [
            prediction
              .fragranceId,
            prediction,
          ],
        ),
    );
  const recommendationById =
    new Map(
      currentPrediction
        .adaptiveRecommendations
        .map(
          (
            recommendation,
          ) => [
            recommendation
              .fragranceId,
            recommendation,
          ],
        ),
    );

  return scenario.steps.map(
    ({
      step,
      result,
    }) => {
      const fragrance =
        catalog.find(
          (candidate) =>
            candidate.id ===
            step.candidateId,
        ) ??
        result.candidate;

      const prediction =
        forecastById.get(
          fragrance.id,
        );
      const recommendation =
        recommendationById.get(
          fragrance.id,
        );

      const learnedFit =
        recommendation
          ?.probability ??
        prediction
          ?.signaturePotential ??
        48;

      const action =
        step.action;

      if (
        action ===
        "remove"
      ) {
        return {
          fragranceId:
            fragrance.id,
          fragranceName:
            fragrance.name,
          brand:
            fragrance.brand,
          action,
          confidence:
            prediction
              ?.confidence ??
            58,
        } satisfies PredictiveCandidateForecast;
      }

      const initialNovelty =
        action ===
        "add"
          ? 1
          : 0.88;
      const monthlyWears =
        roundOne(
          Math.max(
            0.4,
            (
              0.9 +
              learnedFit /
                24
            ) *
              initialNovelty *
              decayForHorizon(
                horizonDays,
              ),
          ),
        );

      const redundancyPenalty =
        Math.max(
          0,
          result.metrics
            .redundancy
            .current -
            result.metrics
              .redundancy
              .projected,
        ) *
        0.45;

      const retentionProbability =
        clamp(
          35 +
            learnedFit *
              0.48 +
            (
              prediction
                ?.signaturePotential ??
              35
            ) *
              0.22 -
            (
              prediction
                ?.retentionRisk ??
              35
            ) *
              0.18 -
            redundancyPenalty,
        );

      const neglectProbability =
        clamp(
          100 -
            retentionProbability +
            Math.max(
              0,
              2.2 -
                monthlyWears,
            ) *
              8,
        );

      const signaturePotential =
        clamp(
          learnedFit *
            0.55 +
            retentionProbability *
              0.25 +
            (
              prediction
                ?.signaturePotential ??
              35
            ) *
              0.2,
        );

      return {
        fragranceId:
          fragrance.id,
        fragranceName:
          fragrance.name,
        brand:
          fragrance.brand,
        action,
        estimatedWearsPerMonth:
          monthlyWears,
        retentionProbability,
        neglectProbability,
        signaturePotential,
        learnedFit:
          Math.round(
            learnedFit,
          ),
        confidence:
          Math.min(
            recommendation
              ?.confidence ??
              prediction
                ?.confidence ??
              55,
            92,
          ),
      } satisfies PredictiveCandidateForecast;
    },
  );
}

function estimateNeglectedCount({
  projectedCollection,
  predictions,
  candidateForecasts,
  horizonDays,
}: {
  projectedCollection:
    CollectionItem[];
  predictions:
    ReturnType<
      typeof buildPredictiveSnapshot
    >["bottlePredictions"];
  candidateForecasts:
    PredictiveCandidateForecast[];
  horizonDays:
    ForecastHorizonDays;
}) {
  const predictionById =
    new Map(
      predictions.map(
        (prediction) => [
          prediction
            .fragranceId,
          prediction,
        ],
      ),
    );
  const candidateById =
    new Map(
      candidateForecasts.map(
        (prediction) => [
          prediction
            .fragranceId,
          prediction,
        ],
      ),
    );

  return projectedCollection
    .filter(
      (item) => {
        const bottle =
          predictionById.get(
            item.fragranceId,
          );
        const candidate =
          candidateById.get(
            item.fragranceId,
          );

        const futureDays =
          item.daysSinceLastWear +
          Math.round(
            horizonDays *
              0.22,
          );

        return (
          (
            bottle
              ?.retentionRisk ??
            0
          ) >=
            68 ||
          (
            candidate
              ?.neglectProbability ??
            0
          ) >=
            68 ||
          (
            futureDays >
              45 &&
            item.wearCount <=
              2
          )
        );
      },
    )
    .length;
}

function classifyOutcome({
  immediateHealthDelta,
  forecastHealthDelta,
  redundancyDelta,
  projectedNeglected,
  projectedSize,
  candidateForecasts,
}: {
  immediateHealthDelta: number;
  forecastHealthDelta: number;
  redundancyDelta: number;
  projectedNeglected: number;
  projectedSize: number;
  candidateForecasts:
    PredictiveCandidateForecast[];
}): PredictiveSimulationForecast["dominantOutcome"] {
  const meanCandidateNeglect =
    average(
      candidateForecasts.map(
        (candidate) =>
          candidate
            .neglectProbability ??
          0,
      ),
    );

  if (
    redundancyDelta <
      -8 ||
    meanCandidateNeglect >=
      68
  ) {
    return "redundancy-risk";
  }

  if (
    projectedSize >
      0 &&
    projectedNeglected /
      projectedSize >=
      0.35
  ) {
    return "rotation-risk";
  }

  if (
    immediateHealthDelta >=
      3 &&
    forecastHealthDelta >=
      3
  ) {
    return "durable-improvement";
  }

  if (
    immediateHealthDelta >=
      2 &&
    forecastHealthDelta <=
      0
  ) {
    return "temporary-excitement";
  }

  return "balanced-change";
}

function buildReasons({
  currentHealth,
  immediateHealth,
  forecastHealth,
  diversityBenefit,
  roleBenefit,
  redundancyPressure,
  candidateForecasts,
  projectedNeglected,
  projectedSize,
}: {
  currentHealth: number;
  immediateHealth: number;
  forecastHealth: number;
  diversityBenefit: number;
  roleBenefit: number;
  redundancyPressure: number;
  candidateForecasts:
    PredictiveCandidateForecast[];
  projectedNeglected: number;
  projectedSize: number;
}) {
  const reasons:
    string[] = [];

  if (
    immediateHealth !==
    currentHealth
  ) {
    reasons.push(
      `Immediate Collection Health moves ${signed(
        immediateHealth -
          currentHealth,
      )} to ${immediateHealth}.`,
    );
  }

  if (
    forecastHealth !==
    immediateHealth
  ) {
    reasons.push(
      `Behavior-adjusted forecast settles near ${forecastHealth}/100 rather than assuming the immediate score lasts unchanged.`,
    );
  }

  if (
    diversityBenefit >=
    4
  ) {
    reasons.push(
      `DNA diversity improves by ${diversityBenefit} points.`,
    );
  }

  if (
    roleBenefit >=
    4
  ) {
    reasons.push(
      `Role coverage improves by ${roleBenefit} points.`,
    );
  }

  if (
    redundancyPressure >=
    5
  ) {
    reasons.push(
      `Redundancy pressure rises by ${redundancyPressure} points.`,
    );
  }

  const strongest =
    [...candidateForecasts]
      .filter(
        (candidate) =>
          candidate.action !==
          "remove",
      )
      .sort(
        (a, b) =>
          (
            b.retentionProbability ??
            0
          ) -
          (
            a.retentionProbability ??
            0
          ),
      )[0];

  if (
    strongest?.retentionProbability !==
    undefined
  ) {
    reasons.push(
      `${strongest.fragranceName} has an estimated ${strongest.retentionProbability}% retention probability and ${strongest.estimatedWearsPerMonth ?? 0} predicted wears/month.`,
    );
  }

  if (
    projectedSize >
      0 &&
    projectedNeglected >
      0
  ) {
    reasons.push(
      `${projectedNeglected} of ${projectedSize} projected bottles may enter neglect territory.`,
    );
  }

  return reasons.slice(
    0,
    5,
  );
}

function buildLimitations({
  events,
  confidence,
  horizonDays,
}: {
  events:
    MemoryEvent[];
  confidence: number;
  horizonDays:
    ForecastHorizonDays;
}) {
  const limitations:
    string[] = [];

  const wears =
    events.filter(
      (event) =>
        event.type ===
        "wear-recorded",
    ).length;

  if (
    wears <
    8
  ) {
    limitations.push(
      `Only ${wears} memory wear events are available; preference learning is still early.`,
    );
  }

  if (
    confidence <
    70
  ) {
    limitations.push(
      "Forecast confidence is limited; treat the range as directional rather than precise.",
    );
  }

  if (
    horizonDays ===
    365
  ) {
    limitations.push(
      "One-year forecasts carry more uncertainty because season, purchases, and taste can change.",
    );
  }

  limitations.push(
    "Projected wear frequency is a heuristic estimate, not a guarantee of future behavior.",
  );

  return limitations;
}

function buildForecastConfidence({
  predictiveConfidence,
  evidenceEvents,
  collectionSize,
  scenarioSteps,
  horizonDays,
}: {
  predictiveConfidence: number;
  evidenceEvents: number;
  collectionSize: number;
  scenarioSteps: number;
  horizonDays:
    ForecastHorizonDays;
}) {
  const evidenceBoost =
    Math.min(
      18,
      Math.sqrt(
        evidenceEvents,
      ) *
        3.5,
    );
  const collectionBoost =
    Math.min(
      8,
      collectionSize *
        0.45,
    );
  const complexityPenalty =
    Math.max(
      0,
      scenarioSteps -
        1,
    ) *
    3;
  const horizonPenalty =
    horizonDays ===
    365
      ? 12
      : horizonDays ===
          180
        ? 6
        : 2;

  return clamp(
    predictiveConfidence *
      0.65 +
      evidenceBoost +
      collectionBoost +
      8 -
      complexityPenalty -
      horizonPenalty,
  );
}

function decayForHorizon(
  horizonDays:
    ForecastHorizonDays,
) {
  return horizonDays ===
    90
    ? 1
    : horizonDays ===
        180
      ? 0.88
      : 0.72;
}

function verdictFor(
  outcome:
    PredictiveSimulationForecast["dominantOutcome"],
) {
  switch (
    outcome
  ) {
    case "durable-improvement":
      return "LIKELY DURABLE IMPROVEMENT";
    case "temporary-excitement":
      return "LIKELY TEMPORARY EXCITEMENT";
    case "redundancy-risk":
      return "OVERLAP MAY OUTLAST NOVELTY";
    case "rotation-risk":
      return "ROTATION PRESSURE LIKELY";
    default:
      return "BALANCED LONG-TERM CHANGE";
  }
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

function signed(
  value: number,
) {
  return value >=
    0
    ? `+${value}`
    : `${value}`;
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

