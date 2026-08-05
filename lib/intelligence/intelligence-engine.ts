export type NeuralCoreStatus = "analyzing" | "current" | "limited";

export interface NeuralCoreFinding {
  title: string;
  explanation: string;
  severity: string;
}

export interface NeuralCoreRecommendation {
  title: string;
  reason: string;
  projectedImpact: number;
}

export interface NeuralCoreHealthAnalysis {
  score: number;
  status: string;
  summary: string;
  confidence?: number;
  findings: NeuralCoreFinding[];
  recommendations: NeuralCoreRecommendation[];
}

export interface NeuralCoreOwnedFragrance {
  fragrance: {
    id: string;
    brand: string;
    name: string;
    seasons: {
      summer: number;
    };
  };
  item: {
    wearCount?: number;
    daysSinceLastWear: number;
  };
}

export interface NeuralCoreInput {
  analysis: NeuralCoreHealthAnalysis;
  owned: NeuralCoreOwnedFragrance[];
  hydrated: boolean;
  now?: Date;
}

export interface NeuralCoreOutput {
  systemStatus: NeuralCoreStatus;
  confidence: number;
  generatedAt: string;
  activeSources: string[];

  collectionHealth: {
    score: number;
    status: string;
    summary: string;
  };

  primaryRecommendation: {
    fragranceId: string;
    fragranceName: string;
    explanation: string;
    confidence: number;
  } | null;

  priorityFinding: NeuralCoreFinding | null;
  priorityAction: NeuralCoreRecommendation | null;

  rotationAlert: {
    fragranceId: string;
    fragranceName: string;
    daysSinceLastWear: number;
  } | null;
}

export function runNeuralCore({
  analysis,
  owned,
  hydrated,
  now = new Date(),
}: NeuralCoreInput): NeuralCoreOutput {
  const wearableCandidates = [...owned]
    .filter(({ item }) => item.daysSinceLastWear >= 7)
    .sort(
      (a, b) =>
        b.fragrance.seasons.summer - a.fragrance.seasons.summer ||
        b.item.daysSinceLastWear - a.item.daysSinceLastWear,
    );

  const recommendedWear = wearableCandidates[0] ?? owned[0] ?? null;

  const rotationCandidate =
    [...owned]
      .filter(({ item }) => item.daysSinceLastWear >= 30)
      .sort(
        (a, b) => b.item.daysSinceLastWear - a.item.daysSinceLastWear,
      )[0] ?? null;

  const healthConfidence = analysis.confidence ?? 85;
  const dataConfidence = hydrated ? Math.min(100, 70 + owned.length * 4) : 45;
  const confidence = Math.round(
    healthConfidence * 0.65 + dataConfidence * 0.35,
  );

  return {
    systemStatus: !hydrated
      ? "analyzing"
      : owned.length === 0
        ? "limited"
        : "current",

    confidence,
    generatedAt: now.toISOString(),

    activeSources: [
      "Collection",
      "Rotation",
      "DNA",
      "Collection Health",
    ],

    collectionHealth: {
      score: analysis.score,
      status: analysis.status,
      summary: analysis.summary,
    },

    primaryRecommendation: recommendedWear
      ? {
          fragranceId: recommendedWear.fragrance.id,
          fragranceName: `${recommendedWear.fragrance.brand} ${recommendedWear.fragrance.name}`,
          explanation: `Strong warm-weather suitability and ${recommendedWear.item.daysSinceLastWear} days since its last wear.`,
          confidence: Math.min(
            98,
            Math.round(
              recommendedWear.fragrance.seasons.summer * 0.7 +
                Math.min(recommendedWear.item.daysSinceLastWear, 30),
            ),
          ),
        }
      : null,

    priorityFinding: analysis.findings[0] ?? null,
    priorityAction: analysis.recommendations[0] ?? null,

    rotationAlert: rotationCandidate
      ? {
          fragranceId: rotationCandidate.fragrance.id,
          fragranceName: `${rotationCandidate.fragrance.brand} ${rotationCandidate.fragrance.name}`,
          daysSinceLastWear: rotationCandidate.item.daysSinceLastWear,
        }
      : null,
  };
}