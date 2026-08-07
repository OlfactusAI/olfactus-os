import type { FragranceRecord, FragranceRole, Season } from "@/lib/domain/fragrance";
import { filterCatalogForEngine, evaluateIntelligenceEligibility } from "@/lib/intelligence/readiness-gateway";
import {
  calibrateIntelligenceScore,
  type CalibratedIntelligenceScore,
} from "@/lib/intelligence/confidence-calibration";

export interface RecommendationCollectionItem {
  fragrance: FragranceRecord;
  item: { wearCount?: number; daysSinceLastWear: number };
}

export interface RecommendationContext {
  season: Season;
  temperatureF?: number;
  humidity?: number;
  desiredRole?: FragranceRole;
  occasion?: string;
}

export interface RecommendationSignal {
  id: "season" | "weather" | "role" | "rotation" | "performance" | "data-quality";
  label: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface WearRecommendation {
  fragranceId: string;
  fragranceName: string;
  score: number;
  confidence: number;
  calibration:
    CalibratedIntelligenceScore;
  summary: string;
  signals: RecommendationSignal[];
}

export interface RecommendationEngineOutput {
  primary: WearRecommendation | null;
  alternatives: WearRecommendation[];
  generatedAt: string;
  modelVersion: "RE-2.0.0";
}

interface RecommendationEngineInput {
  owned: RecommendationCollectionItem[];
  context: RecommendationContext;
  now?: Date;
}

const clamp = (value: number, minimum = 0, maximum = 100) =>
  Math.max(minimum, Math.min(maximum, value));

function intelligenceConfidence(fragrance: FragranceRecord) {
  if (fragrance.intelligence?.confidence !== undefined) return fragrance.intelligence.confidence;
  if (fragrance.intelligenceStatus === "validated") return 96;
  if (fragrance.intelligenceStatus === "calibration") return 86;
  return 62;
}

function getWeatherScore(fragrance: FragranceRecord, context: RecommendationContext) {
  let score = fragrance.seasons[context.season];
  if (context.temperatureF !== undefined) {
    if (context.temperatureF >= 88) score = fragrance.climate?.highHeat ?? fragrance.seasons.summer;
    else if (context.temperatureF <= 48) score = fragrance.climate?.cold ?? fragrance.seasons.winter;
  }
  if (context.humidity !== undefined && context.humidity >= 70) {
    const humidityScore = fragrance.climate?.humidity ?? Math.round(
      fragrance.dna.fresh * 0.55 + fragrance.dna.green * 0.25 + (100 - fragrance.dna.sweet) * 0.2,
    );
    score = score * 0.7 + humidityScore * 0.3;
  }
  return Math.round(clamp(score));
}

function getRotationScore(days: number) {
  if (days >= 45) return 100;
  if (days >= 30) return 94;
  if (days >= 21) return 87;
  if (days >= 14) return 78;
  if (days >= 7) return 66;
  if (days >= 3) return 48;
  return 24;
}

function analyzeCandidate(owned: RecommendationCollectionItem, context: RecommendationContext): WearRecommendation {
  const { fragrance, item } = owned;
  const seasonScore = fragrance.seasons[context.season];
  const weatherScore = getWeatherScore(fragrance, context);
  const roleScore = !context.desiredRole ? 75 : fragrance.roles.includes(context.desiredRole) ? 100 : 38;
  const rotationScore = getRotationScore(item.daysSinceLastWear);
  const performanceScore = Math.round(
    clamp(fragrance.performance.projection * 0.3 + fragrance.performance.longevity * 0.45 + (fragrance.performance.consistency ?? 75) * 0.25),
  );
  const dataQualityScore = intelligenceConfidence(fragrance);
  const signals: RecommendationSignal[] = [
    { id: "season", label: "Season suitability", score: seasonScore, weight: 0.2, explanation: `${fragrance.name} scores ${seasonScore}/100 for ${context.season}.` },
    { id: "weather", label: "Weather compatibility", score: weatherScore, weight: 0.25, explanation: context.temperatureF !== undefined ? `Evaluated for ${context.temperatureF}°F${context.humidity !== undefined ? ` and ${context.humidity}% humidity` : ""}.` : `Weather suitability uses its ${context.season} profile.` },
    { id: "role", label: "Role alignment", score: roleScore, weight: 0.2, explanation: context.desiredRole ? (fragrance.roles.includes(context.desiredRole) ? `Directly supports the ${context.desiredRole} role.` : `Does not primarily serve the ${context.desiredRole} role.`) : "No specific role was requested." },
    { id: "rotation", label: "Rotation priority", score: rotationScore, weight: 0.2, explanation: item.daysSinceLastWear === 0 ? "Worn today." : `Last worn ${item.daysSinceLastWear} days ago.` },
    { id: "performance", label: "Performance reliability", score: performanceScore, weight: 0.1, explanation: `Projection ${fragrance.performance.projection}, longevity ${fragrance.performance.longevity}.` },
    { id: "data-quality", label: "Intelligence quality", score: dataQualityScore, weight: 0.05, explanation: `Record status: ${fragrance.intelligenceStatus}.` },
  ];
  const score = Math.round(signals.reduce((total, signal) => total + signal.score * signal.weight, 0));
  const confidence = Math.round(clamp(dataQualityScore * 0.6 + Math.min(100, signals.length * 7) * 0.4));
  const strongest = [...signals].filter((signal) => signal.id !== "data-quality").sort((a, b) => b.score - a.score).slice(0, 2);
  const eligibility =
    evaluateIntelligenceEligibility(
      fragrance,
    );
  const calibration =
    calibrateIntelligenceScore({
      rawScore: score,
      eligibility,
      evidenceSignals:
        signals.map(
          (signal) => ({
            id: signal.id,
            strength:
              signal.score,
            source:
              signal.id ===
              "data-quality"
                ? "explicit"
                : "derived",
          }),
        ),
    });

  return {
    fragranceId: fragrance.id,
    fragranceName: `${fragrance.brand} ${fragrance.name}`,
    score,
    confidence:
      Math.min(
        confidence,
        calibration.confidence,
      ),
    calibration,
    summary: strongest.map((signal) => signal.explanation).join(" "),
    signals,
  };
}

export function generateWearRecommendations({ owned, context, now = new Date() }: RecommendationEngineInput): RecommendationEngineOutput {
  const eligibleIds = new Set(filterCatalogForEngine(owned.map((item) => item.fragrance), "recommendation").map((item) => item.id));
  const ranked = owned
    .filter(
      (item) =>
        eligibleIds.has(
          item.fragrance.id,
        ),
    )
    .map(
      (item) =>
        analyzeCandidate(
          item,
          context,
        ),
    )
    .sort((a, b) => b.score - a.score || b.confidence - a.confidence || a.fragranceName.localeCompare(b.fragranceName));
  return { primary: ranked[0] ?? null, alternatives: ranked.slice(1, 4), generatedAt: now.toISOString(), modelVersion: "RE-2.0.0" };
}
