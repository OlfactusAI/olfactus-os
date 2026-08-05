import type { FragranceRecord } from "@/lib/domain/fragrance";
import {
  analyzeCollectionIntelligence,
  type CollectionIntelligenceOutput,
} from "@/lib/intelligence/collection-intelligence";
import { generateWearRecommendations } from "@/lib/intelligence/recommendation-engine";
import {
  optimizeRotation,
  type RotationEngineOutput,
} from "@/lib/intelligence/rotation-engine";

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
  fragrance: FragranceRecord;
  item: { wearCount?: number; daysSinceLastWear: number };
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
  collectionHealth: { score: number; status: string; summary: string };
  collectionIntelligence: CollectionIntelligenceOutput;
  rotationIntelligence: RotationEngineOutput;
  primaryRecommendation: {
    fragranceId: string;
    fragranceName: string;
    explanation: string;
    confidence: number;
    score: number;
  } | null;
  alternativeRecommendations: {
    fragranceId: string;
    fragranceName: string;
    explanation: string;
    confidence: number;
    score: number;
  }[];
  priorityFinding: NeuralCoreFinding | null;
  priorityAction: NeuralCoreRecommendation | null;
  rotationAlert: {
    fragranceId: string;
    fragranceName: string;
    daysSinceLastWear: number;
  } | null;
}

export function runNeuralCore({ analysis, owned, hydrated, now = new Date() }: NeuralCoreInput): NeuralCoreOutput {
  const recommendationContext = {
    season: "summer" as const,
    temperatureF: 94,
    humidity: 72,
    desiredRole: "office" as const,
  };

  const wearRecommendations = generateWearRecommendations({
    owned,
    context: recommendationContext,
    now,
  });

  const collectionIntelligence = analyzeCollectionIntelligence({
    owned,
    health: {
      score: analysis.score,
      status: analysis.status,
      summary: analysis.summary,
      confidence: analysis.confidence,
    },
    now,
  });

  const rotationIntelligence = optimizeRotation({
    owned,
    context: {
      season: recommendationContext.season,
      desiredRole: recommendationContext.desiredRole,
      recentWearIds: [],
    },
    now,
  });

  const recommendedWear = wearRecommendations.primary;
  const rotationCandidate = rotationIntelligence.neglected[0] ?? null;
  const healthConfidence = analysis.confidence ?? 85;
  const dataConfidence = hydrated ? Math.min(100, 70 + owned.length * 4) : 45;
  const engineConfidences = [collectionIntelligence.confidence, rotationIntelligence.confidence];
  if (recommendedWear) engineConfidences.push(recommendedWear.confidence);
  const combinedEngineConfidence = Math.round(
    engineConfidences.reduce((total, value) => total + value, 0) / engineConfidences.length,
  );
  const confidence = Math.round(
    healthConfidence * 0.35 + dataConfidence * 0.2 + combinedEngineConfidence * 0.45,
  );

  return {
    systemStatus: !hydrated ? "analyzing" : owned.length === 0 ? "limited" : "current",
    confidence,
    generatedAt: now.toISOString(),
    activeSources: [
      "Collection",
      "Rotation",
      "DNA",
      "Collection Health",
      "Recommendation",
      "Collection Intelligence",
      "Rotation Intelligence",
    ],
    collectionHealth: {
      score: analysis.score,
      status: analysis.status,
      summary: analysis.summary,
    },
    collectionIntelligence,
    rotationIntelligence,
    primaryRecommendation: recommendedWear
      ? {
          fragranceId: recommendedWear.fragranceId,
          fragranceName: recommendedWear.fragranceName,
          explanation: recommendedWear.summary,
          confidence: recommendedWear.confidence,
          score: recommendedWear.score,
        }
      : null,
    alternativeRecommendations: wearRecommendations.alternatives.map((recommendation) => ({
      fragranceId: recommendation.fragranceId,
      fragranceName: recommendation.fragranceName,
      explanation: recommendation.summary,
      confidence: recommendation.confidence,
      score: recommendation.score,
    })),
    priorityFinding: analysis.findings[0] ?? null,
    priorityAction: analysis.recommendations[0] ?? null,
    rotationAlert: rotationCandidate
      ? {
          fragranceId: rotationCandidate.fragranceId,
          fragranceName: rotationCandidate.fragranceName,
          daysSinceLastWear: rotationCandidate.daysSinceLastWear,
        }
      : null,
  };
}
