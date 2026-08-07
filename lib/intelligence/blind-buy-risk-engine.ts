import type {
  DnaDimension,
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type { ProfilePreferences } from "@/lib/intelligence/profile-intelligence-engine";
import type { DecisionLabOutput } from "@/lib/intelligence/decision-lab-engine";
import { assertEligibleForEngine, filterCatalogForEngine } from "@/lib/intelligence/readiness-gateway";
import {
  calibrateIntelligenceScore,
  type CalibratedIntelligenceScore,
} from "@/lib/intelligence/confidence-calibration";

const dnaDimensions: DnaDimension[] = [
  "fresh",
  "green",
  "woody",
  "amber",
  "sweet",
  "dark",
  "artistic",
  "formal",
];

export type BlindBuyRiskTier =
  | "very-low"
  | "low"
  | "moderate"
  | "high"
  | "very-high";

export type BlindBuyVerdict =
  | "strong-buy"
  | "safe-blind-buy"
  | "wait-for-sale"
  | "buy-decant"
  | "sample-first"
  | "avoid";

export interface BlindBuyReason {
  id: string;
  title: string;
  explanation: string;
  impact: number;
  direction: "lowers-risk" | "raises-risk";
}

export interface SimilarOwnedFragrance {
  fragranceId: string;
  fragranceName: string;
  brand: string;
  similarity: number;
  sharedDna: DnaDimension[];
}

export interface BlindBuyRiskOutput {
  modelVersion: "BRI-1.0.0";
  generatedAt: string;
  candidate: FragranceRecord;
  riskScore: number;
  calibration:
    CalibratedIntelligenceScore;
  riskTier: BlindBuyRiskTier;
  verdict: BlindBuyVerdict;
  personalConfidence: number;
  compatibility: number;
  collectionOverlap: number;
  newDna: number;
  novelty: number;
  familiarity: number;
  priceValue: number;
  recommendedPrice: number;
  observedPrice: number;
  priceGap: number;
  reasonsLoweringRisk: BlindBuyReason[];
  reasonsRaisingRisk: BlindBuyReason[];
  similarOwned: SimilarOwnedFragrance[];
  summary: string;
  signalsUsed: string[];
}

export interface BlindBuyRiskInput {
  candidate: FragranceRecord;
  owned: FragranceRecord[];
  preferences: ProfilePreferences;
  decision: DecisionLabOutput;
  observedPrice?: number;
}

export function analyzeBlindBuyRisk({
  candidate,
  owned,
  preferences,
  decision,
  observedPrice,
}: BlindBuyRiskInput): BlindBuyRiskOutput {
  const eligibility =
    assertEligibleForEngine(
      candidate,
      "blind-buy-risk",
    );
  const eligibleOwned =
    filterCatalogForEngine(
      owned,
      "blind-buy-risk",
    );

  const similarOwned = eligibleOwned
    .map((fragrance) => ({
      fragranceId: fragrance.id,
      fragranceName: fragrance.name,
      brand: fragrance.brand,
      similarity: fragranceSimilarity(
        candidate,
        fragrance,
      ),
      sharedDna: strongestSharedDna(
        candidate,
        fragrance,
      ),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 4);

  const collectionOverlap =
    similarOwned[0]?.similarity ?? 0;
  const novelty = clamp(100 - collectionOverlap);
  const familiarity = collectionOverlap;
  const compatibility = decision.metrics.collectionFit;
  const newDna = decision.metrics.dnaExpansion;

  const marketPrice =
    observedPrice ??
    candidate.market?.typicalMarketPrice ??
    candidate.market?.retailPrice ??
    180;

  const baselineValue =
    candidate.market?.valueScore ??
    decision.metrics.value;
  const recommendedPrice = Math.max(
    40,
    Math.round(
      marketPrice *
        clamp(
          (baselineValue +
            decision.metrics.longTermOwnership) /
            180,
          0.55,
          0.98,
        ),
    ),
  );
  const priceGap = marketPrice - recommendedPrice;
  const priceRisk = clamp(
    priceGap <= 0
      ? 0
      : (priceGap / Math.max(1, recommendedPrice)) *
          100,
  );

  const preferenceRisk =
    Math.abs(
      candidate.seasons[
        preferences.preferredSeason
      ] - 100,
    ) *
      0.18 +
    (candidate.roles.includes(
      preferences.preferredRole,
    )
      ? 0
      : 18) +
    Math.max(
      0,
      preferences.minimumLongevity -
        candidate.performance.longevity,
    ) *
      0.7;

  const noveltyRisk =
    novelty >
    preferences.adventurousness + 15
      ? novelty - preferences.adventurousness
      : 0;

  const intensityRisk =
    Math.max(
      0,
      candidate.dna.dark -
        preferences.adventurousness,
    ) *
      0.22 +
    Math.max(
      0,
      candidate.dna.sweet -
        preferences.adventurousness,
    ) *
      0.18 +
    Math.max(
      0,
      candidate.dna.artistic -
        preferences.adventurousness,
    ) *
      0.25;

  const performanceRisk = Math.max(
    0,
    preferences.minimumLongevity -
      candidate.performance.longevity,
  );

  const budgetRisk =
    marketPrice > preferences.budgetCeiling
      ? clamp(
          ((marketPrice -
            preferences.budgetCeiling) /
            Math.max(1, preferences.budgetCeiling)) *
            100,
        )
      : 0;

  const rawRisk =
    decision.metrics.regretRisk * 0.23 +
    collectionOverlap * 0.12 +
    priceRisk * 0.16 +
    budgetRisk * 0.13 +
    preferenceRisk * 0.12 +
    noveltyRisk * 0.1 +
    intensityRisk * 0.08 +
    performanceRisk * 0.06;

  const riskToleranceAdjustment =
    (preferences.riskTolerance - 50) * 0.18;

  const riskScore = Math.round(
    clamp(rawRisk - riskToleranceAdjustment),
  );

  const riskTier = getRiskTier(riskScore);
  const verdict = getVerdict({
    riskScore,
    marketPrice,
    recommendedPrice,
    compatibility,
    decision,
  });

  const reasons = buildReasons({
    candidate,
    preferences,
    decision,
    collectionOverlap,
    novelty,
    marketPrice,
    recommendedPrice,
    budgetRisk,
    performanceRisk,
  });

  const personalConfidence = Math.round(
    clamp(
      decision.confidence * 0.48 +
        compatibility * 0.2 +
        (100 - riskScore) * 0.17 +
        Math.min(100, owned.length * 9) * 0.15,
    ),
  );
  const calibration =
    calibrateIntelligenceScore({
      rawScore: riskScore,
      eligibility,
      evidenceSignals: [
        {
          id:
            "decision-confidence",
          strength:
            decision.confidence,
          source: "derived",
        },
        {
          id: "compatibility",
          strength:
            compatibility,
          source: "derived",
        },
        {
          id:
            "collection-overlap",
          strength:
            collectionOverlap,
          source: "derived",
        },
        {
          id: "price-value",
          strength:
            baselineValue,
          source: "explicit",
        },
        {
          id:
            "preference-fit",
          strength:
            100 -
            preferenceRisk,
          source: "derived",
        },
      ],
      warnings:
        eligibleOwned.length < 2
          ? [
              "Collection-overlap confidence is limited by a small comparison set.",
            ]
          : [],
    });

  return {
    modelVersion: "BRI-1.0.0",
    generatedAt: new Date().toISOString(),
    candidate,
    riskScore,
    calibration,
    riskTier,
    verdict,
    personalConfidence,
    compatibility,
    collectionOverlap,
    newDna,
    novelty,
    familiarity,
    priceValue: Math.round(
      clamp(
        baselineValue * 0.55 +
          decision.metrics.longTermOwnership * 0.45 -
          priceRisk * 0.22,
      ),
    ),
    recommendedPrice,
    observedPrice: Math.round(marketPrice),
    priceGap: Math.round(priceGap),
    reasonsLoweringRisk: reasons
      .filter(
        (reason) =>
          reason.direction === "lowers-risk",
      )
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5),
    reasonsRaisingRisk: reasons
      .filter(
        (reason) =>
          reason.direction === "raises-risk",
      )
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5),
    similarOwned,
    summary: buildSummary({
      candidate,
      riskScore,
      riskTier,
      verdict,
      compatibility,
      novelty,
      collectionOverlap,
      marketPrice,
      recommendedPrice,
    }),
    signalsUsed: [
      "Taste Genome",
      "Wear and Collection Profile",
      "DNA Similarity",
      "Role Alignment",
      "Seasonal Fit",
      "Performance",
      "Observed Price",
      "Budget Ceiling",
      "Risk Tolerance",
      "Adventurousness",
      "Decision Lab",
    ],
  };
}

function buildReasons({
  candidate,
  preferences,
  decision,
  collectionOverlap,
  novelty,
  marketPrice,
  recommendedPrice,
  budgetRisk,
  performanceRisk,
}: {
  candidate: FragranceRecord;
  preferences: ProfilePreferences;
  decision: DecisionLabOutput;
  collectionOverlap: number;
  novelty: number;
  marketPrice: number;
  recommendedPrice: number;
  budgetRisk: number;
  performanceRisk: number;
}): BlindBuyReason[] {
  const reasons: BlindBuyReason[] = [];

  if (
    candidate.roles.includes(
      preferences.preferredRole,
    )
  ) {
    reasons.push({
      id: "role-match",
      title: "Preferred role match",
      explanation: `Supports your preferred ${capitalize(
        preferences.preferredRole,
      )} use case.`,
      impact: 18,
      direction: "lowers-risk",
    });
  } else {
    reasons.push({
      id: "role-mismatch",
      title: "Role mismatch",
      explanation: `Does not directly support your preferred ${capitalize(
        preferences.preferredRole,
      )} role.`,
      impact: 14,
      direction: "raises-risk",
    });
  }

  if (
    candidate.seasons[
      preferences.preferredSeason
    ] >= 80
  ) {
    reasons.push({
      id: "season-match",
      title: "Strong seasonal alignment",
      explanation: `${capitalize(
        preferences.preferredSeason,
      )} suitability is ${
        candidate.seasons[
          preferences.preferredSeason
        ]
      }/100.`,
      impact: 16,
      direction: "lowers-risk",
    });
  } else {
    reasons.push({
      id: "season-limitation",
      title: "Seasonal limitation",
      explanation: `${capitalize(
        preferences.preferredSeason,
      )} suitability is only ${
        candidate.seasons[
          preferences.preferredSeason
        ]
      }/100.`,
      impact: 12,
      direction: "raises-risk",
    });
  }

  if (collectionOverlap <= 40) {
    reasons.push({
      id: "low-overlap",
      title: "Low collection overlap",
      explanation:
        "The fragrance adds a meaningfully different scent direction.",
      impact: 20,
      direction: "lowers-risk",
    });
  } else if (collectionOverlap >= 70) {
    reasons.push({
      id: "high-overlap",
      title: "High collection overlap",
      explanation:
        "A closely related scent profile is already owned.",
      impact: 22,
      direction: "raises-risk",
    });
  }

  if (
    candidate.performance.longevity >=
    preferences.minimumLongevity
  ) {
    reasons.push({
      id: "performance-match",
      title: "Performance meets expectations",
      explanation: `Longevity is ${candidate.performance.longevity}/100 against your ${preferences.minimumLongevity}/100 minimum.`,
      impact: 15,
      direction: "lowers-risk",
    });
  } else if (performanceRisk > 0) {
    reasons.push({
      id: "performance-gap",
      title: "Performance below preference",
      explanation: `Longevity falls ${Math.round(
        performanceRisk,
      )} points below your stated minimum.`,
      impact: 16,
      direction: "raises-risk",
    });
  }

  if (
    novelty <=
    preferences.adventurousness + 10
  ) {
    reasons.push({
      id: "novelty-fit",
      title: "Novelty matches your profile",
      explanation: `${novelty}/100 novelty is compatible with ${preferences.adventurousness}/100 adventurousness.`,
      impact: 13,
      direction: "lowers-risk",
    });
  } else {
    reasons.push({
      id: "novelty-gap",
      title: "High surprise factor",
      explanation: `${novelty}/100 novelty exceeds your demonstrated comfort range.`,
      impact: 18,
      direction: "raises-risk",
    });
  }

  if (marketPrice <= recommendedPrice) {
    reasons.push({
      id: "price-opportunity",
      title: "Price is within the buy window",
      explanation: `The observed price is at or below the recommended $${recommendedPrice} threshold.`,
      impact: 17,
      direction: "lowers-risk",
    });
  } else {
    reasons.push({
      id: "price-premium",
      title: "Price exceeds the buy window",
      explanation: `The observed $${Math.round(
        marketPrice,
      )} price is above the recommended $${recommendedPrice} level.`,
      impact: Math.max(12, Math.round(budgetRisk)),
      direction: "raises-risk",
    });
  }

  if (
    decision.metrics.longTermOwnership >= 80
  ) {
    reasons.push({
      id: "long-term",
      title: "High long-term usefulness",
      explanation:
        "Decision Lab predicts sustained use beyond initial novelty.",
      impact: 16,
      direction: "lowers-risk",
    });
  }

  return reasons;
}

function getRiskTier(
  score: number,
): BlindBuyRiskTier {
  if (score <= 24) return "very-low";
  if (score <= 39) return "low";
  if (score <= 59) return "moderate";
  if (score <= 74) return "high";
  return "very-high";
}

function getVerdict({
  riskScore,
  marketPrice,
  recommendedPrice,
  compatibility,
  decision,
}: {
  riskScore: number;
  marketPrice: number;
  recommendedPrice: number;
  compatibility: number;
  decision: DecisionLabOutput;
}): BlindBuyVerdict {
  if (
    riskScore <= 20 &&
    compatibility >= 85 &&
    decision.verdict === "buy"
  ) {
    return "strong-buy";
  }
  if (
    riskScore <= 32 &&
    decision.verdict === "buy"
  ) {
    return "safe-blind-buy";
  }
  if (
    marketPrice >
      recommendedPrice * 1.16 &&
    riskScore < 60
  ) {
    return "wait-for-sale";
  }
  if (riskScore <= 48) {
    return "buy-decant";
  }
  if (riskScore <= 68) {
    return "sample-first";
  }
  return "avoid";
}

function fragranceSimilarity(
  first: FragranceRecord,
  second: FragranceRecord,
) {
  let dot = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (const dimension of dnaDimensions) {
    dot +=
      first.dna[dimension] *
      second.dna[dimension];
    firstMagnitude += first.dna[dimension] ** 2;
    secondMagnitude +=
      second.dna[dimension] ** 2;
  }

  const cosine =
    dot /
    (Math.sqrt(firstMagnitude) *
      Math.sqrt(secondMagnitude) || 1);

  const sharedRoles = first.roles.filter(
    (role) => second.roles.includes(role),
  ).length;
  const roleUnion = new Set([
    ...first.roles,
    ...second.roles,
  ]).size;

  return Math.round(
    clamp(
      (cosine * 0.72 +
        (sharedRoles / Math.max(1, roleUnion)) *
          0.2 +
        (first.family === second.family
          ? 0.08
          : 0)) *
        100,
    ),
  );
}

function strongestSharedDna(
  first: FragranceRecord,
  second: FragranceRecord,
) {
  return dnaDimensions
    .map((dimension) => ({
      dimension,
      strength: Math.min(
        first.dna[dimension],
        second.dna[dimension],
      ),
    }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map(({ dimension }) => dimension);
}

function buildSummary({
  candidate,
  riskScore,
  riskTier,
  verdict,
  compatibility,
  novelty,
  collectionOverlap,
  marketPrice,
  recommendedPrice,
}: {
  candidate: FragranceRecord;
  riskScore: number;
  riskTier: BlindBuyRiskTier;
  verdict: BlindBuyVerdict;
  compatibility: number;
  novelty: number;
  collectionOverlap: number;
  marketPrice: number;
  recommendedPrice: number;
}) {
  const priceSentence =
    marketPrice <= recommendedPrice
      ? "The observed price is within the recommended purchase window."
      : `The observed price is above the recommended $${recommendedPrice} purchase window.`;

  return `${candidate.name} receives a ${riskScore}/100 ${formatRiskTier(
    riskTier,
  ).toLowerCase()} blind-buy risk score and a ${formatVerdict(
    verdict,
  )} verdict. Personal collection compatibility is ${compatibility}/100, novelty is ${novelty}/100, and maximum owned-bottle overlap is ${collectionOverlap}%. ${priceSentence}`;
}

export function formatRiskTier(
  value: BlindBuyRiskTier,
) {
  return {
    "very-low": "Very Low Risk",
    low: "Low Risk",
    moderate: "Moderate Risk",
    high: "High Risk",
    "very-high": "Very High Risk",
  }[value];
}

export function formatVerdict(
  value: BlindBuyVerdict,
) {
  return {
    "strong-buy": "Strong Buy",
    "safe-blind-buy": "Safe Blind Buy",
    "wait-for-sale": "Wait for Sale",
    "buy-decant": "Buy Decant",
    "sample-first": "Sample First",
    avoid: "Avoid",
  }[value];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.min(maximum, Math.max(minimum, value));
}
