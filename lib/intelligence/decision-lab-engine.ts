import type { CollectionHealthAnalysis } from "@/lib/domain/analysis";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import {
  generateDiscoveryIntelligence,
  type DiscoveryImpactDimension,
  type DiscoveryRecommendation,
  type NeuralPipelineStage,
} from "@/lib/intelligence/discovery-engine";

export type DecisionVerdict = "buy" | "sample" | "skip";
export type DecisionStrength = "strong" | "moderate" | "cautious";

export interface DecisionReason {
  type: "positive" | "watch";
  title: string;
  explanation: string;
  score?: number;
}

export interface DecisionLabOutput {
  modelVersion: "DL-1.0.0";
  generatedAt: string;
  verdict: DecisionVerdict;
  strength: DecisionStrength;
  score: number;
  confidence: number;
  candidate: FragranceRecord;
  recommendation: DiscoveryRecommendation;
  analystReport: string;
  positiveReasons: DecisionReason[];
  watchReasons: DecisionReason[];
  impactDimensions: DiscoveryImpactDimension[];
  pipeline: NeuralPipelineStage[];
  metrics: {
    collectionFit: number;
    overlapRisk: number;
    dnaExpansion: number;
    seasonValue: number;
    roleValue: number;
    performance: number;
    value: number;
    longTermOwnership: number;
    regretRisk: number;
  };
}

export interface DecisionLabInput {
  candidate: FragranceRecord;
  owned: FragranceRecord[];
  analysis: CollectionHealthAnalysis;
  price?: number;
}

export function analyzeDecisionLab({
  candidate,
  owned,
  analysis,
  price,
}: DecisionLabInput): DecisionLabOutput {
  const discovery = generateDiscoveryIntelligence({
    owned,
    candidates: [candidate],
    analysis,
  });

  const recommendation = discovery.primary;

  if (!recommendation) {
    throw new Error("Decision Lab requires one candidate.");
  }

  const ownedAlready = owned.some(
    (fragrance) => fragrance.id === candidate.id,
  );

  const collectionFit = recommendation.dnaMatch;
  const overlapRisk = recommendation.overlapRisk;
  const dnaExpansion =
    recommendation.signals.find(
      (signal) => signal.id === "dna-expansion",
    )?.score ?? 0;
  const seasonValue =
    recommendation.signals.find(
      (signal) => signal.id === "season-value",
    )?.score ?? 0;
  const roleValue =
    recommendation.signals.find(
      (signal) => signal.id === "role-value",
    )?.score ?? 0;
  const performance =
    recommendation.signals.find(
      (signal) => signal.id === "performance",
    )?.score ?? 0;

  const marketPrice =
    price ??
    candidate.market?.typicalMarketPrice ??
    candidate.market?.retailPrice ??
    180;

  const valueBase = candidate.market?.valueScore ?? 72;
  const pricePenalty =
    marketPrice > 500
      ? 25
      : marketPrice > 350
        ? 16
        : marketPrice > 220
          ? 8
          : 0;

  const value = clamp(valueBase - pricePenalty + performance * 0.12);

  const longTermOwnership = clamp(
    collectionFit * 0.28 +
      dnaExpansion * 0.2 +
      roleValue * 0.18 +
      seasonValue * 0.12 +
      performance * 0.14 +
      value * 0.08,
  );

  const regretRisk = clamp(
    overlapRisk * 0.34 +
      (100 - collectionFit) * 0.18 +
      (100 - longTermOwnership) * 0.22 +
      pricePenalty * 1.04 +
      (recommendation.blindBuyRisk === "high"
        ? 20
        : recommendation.blindBuyRisk === "moderate"
          ? 11
          : recommendation.blindBuyRisk === "low"
            ? 5
            : 1),
  );

  const decisionScore = Math.round(
    clamp(
      recommendation.score * 0.34 +
        collectionFit * 0.12 +
        dnaExpansion * 0.12 +
        roleValue * 0.11 +
        seasonValue * 0.08 +
        performance * 0.08 +
        value * 0.07 +
        longTermOwnership * 0.08 -
        regretRisk * 0.16 -
        (ownedAlready ? 55 : 0),
    ),
  );

  const verdict: DecisionVerdict = ownedAlready
    ? "skip"
    : decisionScore >= 76 && regretRisk <= 38
      ? "buy"
      : decisionScore >= 56 && regretRisk <= 58
        ? "sample"
        : "skip";

  const strength: DecisionStrength =
    verdict === "buy" && decisionScore >= 86
      ? "strong"
      : verdict === "skip" && decisionScore <= 38
        ? "strong"
        : regretRisk >= 55
          ? "cautious"
          : "moderate";

  const positiveReasons = buildPositiveReasons({
    candidate,
    recommendation,
    dnaExpansion,
    roleValue,
    seasonValue,
    performance,
    value,
    longTermOwnership,
  });

  const watchReasons = buildWatchReasons({
    candidate,
    overlapRisk,
    regretRisk,
    marketPrice,
    value,
    ownedAlready,
    blindBuyRisk: recommendation.blindBuyRisk,
  });

  return {
    modelVersion: "DL-1.0.0",
    generatedAt: new Date().toISOString(),
    verdict,
    strength,
    score: decisionScore,
    confidence: Math.round(
      clamp(
        recommendation.confidence * 0.58 +
          longTermOwnership * 0.18 +
          (100 - regretRisk) * 0.24,
      ),
    ),
    candidate,
    recommendation,
    analystReport: createAnalystReport({
      candidate,
      verdict,
      decisionScore,
      analysis,
      recommendation,
      dnaExpansion,
      overlapRisk,
      performance,
      value,
      regretRisk,
    }),
    positiveReasons,
    watchReasons,
    impactDimensions: recommendation.impactDimensions,
    pipeline: [
      ...discovery.pipeline,
      {
        id: "decision-verdict",
        label: "Finalizing purchase verdict",
        status: "complete",
        confidence: recommendation.confidence,
      },
    ],
    metrics: {
      collectionFit,
      overlapRisk,
      dnaExpansion,
      seasonValue,
      roleValue,
      performance,
      value: Math.round(value),
      longTermOwnership: Math.round(longTermOwnership),
      regretRisk: Math.round(regretRisk),
    },
  };
}

function buildPositiveReasons({
  candidate,
  recommendation,
  dnaExpansion,
  roleValue,
  seasonValue,
  performance,
  value,
  longTermOwnership,
}: {
  candidate: FragranceRecord;
  recommendation: DiscoveryRecommendation;
  dnaExpansion: number;
  roleValue: number;
  seasonValue: number;
  performance: number;
  value: number;
  longTermOwnership: number;
}): DecisionReason[] {
  const reasons: DecisionReason[] = [];

  if (dnaExpansion >= 70) {
    reasons.push({
      type: "positive",
      title: "Expands collection DNA",
      explanation: `${candidate.family} adds meaningful scent-direction coverage.`,
      score: dnaExpansion,
    });
  }

  if (roleValue >= 65) {
    reasons.push({
      type: "positive",
      title: "Fills a useful role",
      explanation: recommendation.primaryRole
        ? `Strengthens ${capitalize(recommendation.primaryRole)} coverage.`
        : "Strengthens a high-value role in the collection.",
      score: roleValue,
    });
  }

  if (recommendation.originality >= 76) {
    reasons.push({
      type: "positive",
      title: "Low redundancy",
      explanation: "The candidate remains meaningfully distinct from owned bottles.",
      score: recommendation.originality,
    });
  }

  if (seasonValue >= 78) {
    reasons.push({
      type: "positive",
      title: "Strong seasonal value",
      explanation: `${capitalize(recommendation.strongestSeason)} is the strongest use case.`,
      score: seasonValue,
    });
  }

  if (performance >= 80) {
    reasons.push({
      type: "positive",
      title: "Reliable performance",
      explanation: "Projection and longevity support repeat ownership value.",
      score: performance,
    });
  }

  if (value >= 76) {
    reasons.push({
      type: "positive",
      title: "Efficient purchase",
      explanation: "Expected ownership value remains strong relative to cost.",
      score: Math.round(value),
    });
  }

  if (longTermOwnership >= 80) {
    reasons.push({
      type: "positive",
      title: "High long-term ownership potential",
      explanation: "The engine predicts sustained usefulness beyond initial novelty.",
      score: Math.round(longTermOwnership),
    });
  }

  return reasons.slice(0, 5);
}

function buildWatchReasons({
  candidate,
  overlapRisk,
  regretRisk,
  marketPrice,
  value,
  ownedAlready,
  blindBuyRisk,
}: {
  candidate: FragranceRecord;
  overlapRisk: number;
  regretRisk: number;
  marketPrice: number;
  value: number;
  ownedAlready: boolean;
  blindBuyRisk: DiscoveryRecommendation["blindBuyRisk"];
}): DecisionReason[] {
  const reasons: DecisionReason[] = [];

  if (ownedAlready) {
    reasons.push({
      type: "watch",
      title: "Already owned",
      explanation: "Buying another bottle would add no new collection value.",
      score: 100,
    });
  }

  if (overlapRisk >= 62) {
    reasons.push({
      type: "watch",
      title: "Meaningful overlap",
      explanation: "A similar role or DNA profile already exists in the collection.",
      score: overlapRisk,
    });
  }

  if (marketPrice >= 300) {
    reasons.push({
      type: "watch",
      title: "Premium acquisition cost",
      explanation: `At approximately $${Math.round(marketPrice)}, sampling first protects against avoidable regret.`,
    });
  }

  if (blindBuyRisk === "moderate" || blindBuyRisk === "high") {
    reasons.push({
      type: "watch",
      title: "Sample before committing",
      explanation: "The scent profile carries enough uncertainty to justify a controlled trial.",
    });
  }

  if (value < 65) {
    reasons.push({
      type: "watch",
      title: "Value efficiency is limited",
      explanation: "The expected collection gain may not fully justify current pricing.",
      score: Math.round(value),
    });
  }

  if (regretRisk >= 45) {
    reasons.push({
      type: "watch",
      title: "Regret probability is elevated",
      explanation: "Cost, overlap, or long-term usefulness lowers purchase certainty.",
      score: Math.round(regretRisk),
    });
  }

  if (!reasons.length) {
    reasons.push({
      type: "watch",
      title: "No major warning signal",
      explanation: "The primary remaining risk is personal preference at first wear.",
    });
  }

  return reasons.slice(0, 4);
}

function createAnalystReport({
  candidate,
  verdict,
  decisionScore,
  analysis,
  recommendation,
  dnaExpansion,
  overlapRisk,
  performance,
  value,
  regretRisk,
}: {
  candidate: FragranceRecord;
  verdict: DecisionVerdict;
  decisionScore: number;
  analysis: CollectionHealthAnalysis;
  recommendation: DiscoveryRecommendation;
  dnaExpansion: number;
  overlapRisk: number;
  performance: number;
  value: number;
  regretRisk: number;
}) {
  const verdictSentence =
    verdict === "buy"
      ? "The engine supports a full-bottle purchase."
      : verdict === "sample"
        ? "The engine supports sampling before a full-bottle commitment."
        : "The engine recommends skipping this purchase.";

  const expansionSentence =
    dnaExpansion >= 72
      ? `It introduces meaningful ${candidate.family} DNA.`
      : `It remains close to scent directions you already own.`;

  const overlapSentence =
    overlapRisk <= 40
      ? "Redundancy is low."
      : overlapRisk <= 65
        ? "Overlap is manageable but should be considered."
        : "Overlap is high enough to reduce strategic value.";

  return `${verdictSentence} ${candidate.name} receives a ${decisionScore}/100 purchase score against a collection currently rated ${analysis.score}/100. ${expansionSentence} ${overlapSentence} Performance scores ${Math.round(
    performance,
  )}/100, value efficiency scores ${Math.round(
    value,
  )}/100, and projected Collection Health changes from ${analysis.score} to ${recommendation.projectedHealth}. Estimated regret risk is ${Math.round(
    regretRisk,
  )}%.`;
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
