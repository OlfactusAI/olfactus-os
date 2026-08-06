import type { CollectionItem } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import type {
  PurchasePredictionOutcome,
  PurchasePredictionRecord,
  PredictionMaturity,
} from "@/lib/predictions/types";

export interface PredictionAccuracyOutput {
  modelVersion: "PPA-1.0.0";
  overallAccuracy: number;
  decisionAccuracy: number;
  blindBuyRiskAccuracy: number;
  healthImpactAccuracy: number;
  valueAccuracy: number;
  maturedPredictions: number;
  pendingPredictions: number;
  verifiedPredictions: number;
  outcomes: Array<{
    prediction: PurchasePredictionRecord;
    outcome: PurchasePredictionOutcome;
  }>;
  calibrationInsights: string[];
  strongestCategory: string;
  weakestCategory: string;
}

export function analyzePredictionAccuracy({
  predictions,
  collection,
  fragrances,
  currentCollectionHealth,
  currentRedundancy,
}: {
  predictions: PurchasePredictionRecord[];
  collection: CollectionItem[];
  fragrances: FragranceRecord[];
  currentCollectionHealth: number;
  currentRedundancy: number;
}): PredictionAccuracyOutput {
  const outcomes = predictions
    .map((prediction) => {
      const item = collection.find(
        (entry) =>
          entry.fragranceId ===
          prediction.fragranceId,
      );
      const fragrance = fragrances.find(
        (entry) =>
          entry.id === prediction.fragranceId,
      );

      if (!item || !fragrance) return null;

      const wearsSincePurchase = Math.max(
        0,
        item.wearCount -
          prediction.baselineWearCount,
      );

      const ageDays = prediction.purchaseConfirmedAt
        ? Math.max(
            0,
            Math.floor(
              (Date.now() -
                new Date(
                  prediction.purchaseConfirmedAt,
                ).getTime()) /
                86_400_000,
            ),
          )
        : 0;

      const maturity =
        determineMaturity({
          ageDays,
          wearsSincePurchase,
          personalRating:
            item.personalRating,
        });

      const satisfactionScore =
        calculateSatisfaction({
          wearsSincePurchase,
          personalRating:
            item.personalRating,
          ageDays,
          favorite:
            item.favorite ?? false,
        });

      const actualHealthGain =
        currentCollectionHealth -
        prediction.baselineCollectionHealth;

      const verdictCorrect =
        evaluateVerdictCorrectness({
          verdict:
            prediction.originalVerdict,
          satisfactionScore,
          wearsSincePurchase,
        });

      const riskAccuracy = accuracyFromDifference(
        prediction.originalBlindBuyRisk,
        100 - satisfactionScore,
      );

      const healthImpactAccuracy =
        accuracyFromDifference(
          prediction.predictedHealthGain,
          actualHealthGain,
          20,
        );

      const longTermValueAccuracy =
        accuracyFromDifference(
          prediction.predictedLongTermValue,
          satisfactionScore,
        );

      const overallAccuracy = Math.round(
        clamp(
          (verdictCorrect ? 100 : 35) *
            0.3 +
            riskAccuracy * 0.24 +
            healthImpactAccuracy * 0.22 +
            longTermValueAccuracy * 0.24,
        ),
      );

      const costPerWear =
        prediction.purchasePrice &&
        wearsSincePurchase > 0
          ? Math.round(
              (prediction.purchasePrice /
                wearsSincePurchase) *
                100,
            ) / 100
          : undefined;

      const outcome: PurchasePredictionOutcome = {
        predictionId: prediction.id,
        currentWearCount: item.wearCount,
        wearsSincePurchase,
        personalRating:
          item.personalRating,
        actualHealthGain,
        currentRedundancy,
        costPerWear,
        satisfactionScore,
        verdictCorrect,
        riskAccuracy,
        healthImpactAccuracy,
        longTermValueAccuracy,
        overallAccuracy,
      };

      return {
        prediction: {
          ...prediction,
          maturity,
        },
        outcome,
        fragrance,
      };
    })
    .filter(Boolean) as Array<{
      prediction: PurchasePredictionRecord;
      outcome: PurchasePredictionOutcome;
      fragrance: FragranceRecord;
    }>;

  const matured = outcomes.filter(
    ({ prediction }) =>
      prediction.maturity === "matured" ||
      prediction.maturity === "verified",
  );

  const scoreSource =
    matured.length > 0 ? matured : outcomes;

  const overallAccuracy = average(
    scoreSource.map(
      ({ outcome }) => outcome.overallAccuracy,
    ),
  );

  const decisionAccuracy = average(
    scoreSource.map(({ outcome }) =>
      outcome.verdictCorrect ? 100 : 0,
    ),
  );

  const blindBuyRiskAccuracy = average(
    scoreSource.map(
      ({ outcome }) => outcome.riskAccuracy,
    ),
  );

  const healthImpactAccuracy = average(
    scoreSource.map(
      ({ outcome }) =>
        outcome.healthImpactAccuracy,
    ),
  );

  const valueAccuracy = average(
    scoreSource.map(
      ({ outcome }) =>
        outcome.longTermValueAccuracy,
    ),
  );

  const categoryScores = categoryAccuracy(
    scoreSource,
  );

  return {
    modelVersion: "PPA-1.0.0",
    overallAccuracy,
    decisionAccuracy,
    blindBuyRiskAccuracy,
    healthImpactAccuracy,
    valueAccuracy,
    maturedPredictions: matured.length,
    pendingPredictions: outcomes.filter(
      ({ prediction }) =>
        prediction.maturity === "pending" ||
        prediction.maturity === "early-signal",
    ).length,
    verifiedPredictions: outcomes.filter(
      ({ prediction }) =>
        prediction.maturity === "verified",
    ).length,
    outcomes: outcomes.map(
      ({ prediction, outcome }) => ({
        prediction,
        outcome,
      }),
    ),
    calibrationInsights:
      buildCalibrationInsights({
        overallAccuracy,
        decisionAccuracy,
        blindBuyRiskAccuracy,
        healthImpactAccuracy,
        valueAccuracy,
        maturedCount: matured.length,
      }),
    strongestCategory:
      categoryScores[0]?.label ??
      "Still calibrating",
    weakestCategory:
      categoryScores.at(-1)?.label ??
      "Still calibrating",
  };
}

function determineMaturity({
  ageDays,
  wearsSincePurchase,
  personalRating,
}: {
  ageDays: number;
  wearsSincePurchase: number;
  personalRating?: number;
}): PredictionMaturity {
  if (ageDays >= 120 && wearsSincePurchase >= 12) {
    return "verified";
  }
  if (ageDays >= 60 && wearsSincePurchase >= 7) {
    return "matured";
  }
  if (ageDays >= 21 || wearsSincePurchase >= 3) {
    return "early-signal";
  }
  if (
    ageDays === 0 &&
    wearsSincePurchase === 0 &&
    personalRating == null
  ) {
    return "pending";
  }
  return "insufficient-data";
}

function calculateSatisfaction({
  wearsSincePurchase,
  personalRating,
  ageDays,
  favorite,
}: {
  wearsSincePurchase: number;
  personalRating?: number;
  ageDays: number;
  favorite: boolean;
}) {
  const wearVelocity =
    ageDays > 0
      ? clamp(
          (wearsSincePurchase / ageDays) * 900,
        )
      : wearsSincePurchase > 0
        ? 70
        : 0;

  const ratingScore =
    personalRating != null
      ? clamp(personalRating * 10)
      : 60;

  return Math.round(
    clamp(
      wearVelocity * 0.42 +
        ratingScore * 0.46 +
        (favorite ? 100 : 55) * 0.12,
    ),
  );
}

function evaluateVerdictCorrectness({
  verdict,
  satisfactionScore,
  wearsSincePurchase,
}: {
  verdict:
    | "strong-buy"
    | "buy"
    | "sample"
    | "skip"
    | "avoid";
  satisfactionScore: number;
  wearsSincePurchase: number;
}) {
  if (
    verdict === "strong-buy" ||
    verdict === "buy"
  ) {
    return (
      satisfactionScore >= 72 &&
      wearsSincePurchase >= 4
    );
  }

  if (verdict === "sample") {
    return (
      satisfactionScore >= 45 &&
      satisfactionScore <= 84
    );
  }

  return satisfactionScore < 55;
}

function accuracyFromDifference(
  predicted: number,
  actual: number,
  scale = 100,
) {
  return Math.round(
    clamp(
      100 -
        (Math.abs(predicted - actual) /
          scale) *
          100,
    ),
  );
}

function categoryAccuracy(
  outcomes: Array<{
    prediction: PurchasePredictionRecord;
    outcome: PurchasePredictionOutcome;
    fragrance: FragranceRecord;
  }>,
) {
  const groups = new Map<
    string,
    number[]
  >();

  for (const item of outcomes) {
    const label =
      item.fragrance.family;
    const values = groups.get(label) ?? [];
    values.push(
      item.outcome.overallAccuracy,
    );
    groups.set(label, values);
  }

  return [...groups.entries()]
    .map(([label, values]) => ({
      label,
      accuracy: average(values),
    }))
    .sort(
      (a, b) => b.accuracy - a.accuracy,
    );
}

function buildCalibrationInsights({
  overallAccuracy,
  decisionAccuracy,
  blindBuyRiskAccuracy,
  healthImpactAccuracy,
  valueAccuracy,
  maturedCount,
}: {
  overallAccuracy: number;
  decisionAccuracy: number;
  blindBuyRiskAccuracy: number;
  healthImpactAccuracy: number;
  valueAccuracy: number;
  maturedCount: number;
}) {
  const insights: string[] = [];

  if (maturedCount === 0) {
    insights.push(
      "No predictions have fully matured yet. Continue logging wears and ratings to improve reliability.",
    );
  }

  const scores = [
    {
      label: "Decision verdicts",
      value: decisionAccuracy,
    },
    {
      label: "Blind-buy risk",
      value: blindBuyRiskAccuracy,
    },
    {
      label: "Health impact",
      value: healthImpactAccuracy,
    },
    {
      label: "Long-term value",
      value: valueAccuracy,
    },
  ].sort((a, b) => b.value - a.value);

  if (scores[0]) {
    insights.push(
      `${scores[0].label} is currently the strongest prediction category at ${scores[0].value}% accuracy.`,
    );
  }

  if (scores.at(-1)) {
    insights.push(
      `${scores.at(-1)!.label} requires the most calibration at ${scores.at(-1)!.value}% accuracy.`,
    );
  }

  insights.push(
    `Overall personal-model accuracy is ${overallAccuracy}%, based on the outcomes currently available.`,
  );

  return insights;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) /
      values.length,
  );
}

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.min(maximum, Math.max(minimum, value));
}
