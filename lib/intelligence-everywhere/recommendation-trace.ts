import type {
  RecommendationTrace,
  RecommendationTraceStep,
} from "@/lib/intelligence-everywhere/types";

export function buildRecommendationTrace({
  recommendation,
  confidence,
  weather,
  collection,
  roleGap,
  budget,
  dnaDiversity,
  performance,
}: {
  recommendation: string;
  confidence: number;
  weather: string;
  collection: string;
  roleGap: string;
  budget: string;
  dnaDiversity: string;
  performance: string;
}): RecommendationTrace {
  const steps:
    RecommendationTraceStep[] = [
      {
        id: "weather",
        label: "Weather",
        value: weather,
        explanation:
          "Current conditions establish the performance and comfort context.",
      },
      {
        id: "collection",
        label: "Collection",
        value: collection,
        explanation:
          "Current ownership determines redundancy and replacement pressure.",
      },
      {
        id: "role-gap",
        label: "Role Gap",
        value: roleGap,
        explanation:
          "The engine checks whether the recommendation fills a meaningful role.",
      },
      {
        id: "budget",
        label: "Budget",
        value: budget,
        explanation:
          "Affordability and value are evaluated before recommendation strength increases.",
      },
      {
        id: "dna-diversity",
        label: "DNA Diversity",
        value: dnaDiversity,
        explanation:
          "The recommendation is compared against dominant collection DNA.",
      },
      {
        id: "performance",
        label: "Performance",
        value: performance,
        explanation:
          "Longevity, projection, and situational reliability are considered.",
      },
    ];

  return {
    id:
      `trace:${recommendation.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    recommendation,
    confidence:
      Math.max(
        0,
        Math.min(
          100,
          Math.round(confidence),
        ),
      ),
    steps,
  };
}
