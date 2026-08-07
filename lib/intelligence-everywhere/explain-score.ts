import type {
  ExplainedScore,
  IntelligenceEvidence,
} from "@/lib/intelligence-everywhere/types";

export function explainScore({
  id,
  label,
  score,
  confidence,
  evidence,
}: {
  id: string;
  label: string;
  score: number;
  confidence: number;
  evidence: IntelligenceEvidence[];
}): ExplainedScore {
  const positives = evidence
    .filter((item) => item.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5)
    .map((item) => item.explanation);

  const negatives = evidence
    .filter((item) => item.contribution < 0)
    .sort((a, b) => a.contribution - b.contribution)
    .slice(0, 5)
    .map((item) => item.explanation);

  return {
    id,
    label,
    score: clamp(score),
    confidence: clamp(confidence),
    positives,
    negatives,
    evidence,
  };
}

export function buildCollectionHealthExplanation({
  healthScore,
  roleCoverage,
  seasonalBalance,
  dnaDiversity,
  redundancy,
  rotationBalance,
}: {
  healthScore: number;
  roleCoverage: number;
  seasonalBalance: number;
  dnaDiversity: number;
  redundancy: number;
  rotationBalance: number;
}) {
  return explainScore({
    id: "collection-health",
    label: "Collection Health",
    score: healthScore,
    confidence: 94,
    evidence: [
      {
        source: "collection",
        label: "Role coverage",
        weight: 0.24,
        contribution: roleCoverage - 70,
        explanation:
          roleCoverage >= 80
            ? "Excellent role coverage."
            : "Several collection roles remain under-covered.",
      },
      {
        source: "collection",
        label: "Seasonal balance",
        weight: 0.2,
        contribution: seasonalBalance - 70,
        explanation:
          seasonalBalance >= 80
            ? "Strong seasonal balance."
            : "Seasonal coverage is uneven.",
      },
      {
        source: "entity-graph",
        label: "DNA diversity",
        weight: 0.24,
        contribution: dnaDiversity - 70,
        explanation:
          dnaDiversity >= 80
            ? "Good DNA diversity."
            : "The collection is clustering around similar DNA.",
      },
      {
        source: "collection",
        label: "Redundancy",
        weight: 0.16,
        contribution: 35 - redundancy,
        explanation:
          redundancy <= 35
            ? "Low redundancy supports collection efficiency."
            : "Too many bottles overlap.",
      },
      {
        source: "history",
        label: "Rotation balance",
        weight: 0.16,
        contribution: rotationBalance - 70,
        explanation:
          rotationBalance >= 80
            ? "Rotation is well distributed."
            : "Rotation imbalance is reducing collection efficiency.",
      },
    ],
  });
}

function clamp(value: number) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}
