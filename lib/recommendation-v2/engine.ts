import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
  Season,
} from "@/lib/domain/fragrance";
import {
  generateRecommendationCandidates,
} from "@/lib/recommendation-v2/candidate-generator";
import {
  scoreBlindBuyRisk,
  scoreBudget,
  scoreOverlap,
  scorePreference,
  scoreRoleGap,
  scoreSeason,
  scoreWeather,
} from "@/lib/recommendation-v2/factor-engines";
import {
  analyzeTradeoffs,
} from "@/lib/recommendation-v2/tradeoff-engine";
import {
  calculateOpportunityCost,
} from "@/lib/recommendation-v2/opportunity-cost";
import type {
  RecommendationCandidateV2,
  RecommendationRunV2,
} from "@/lib/recommendation-v2/types";

export function runNeuralRecommendationEngineV2({
  catalog,
  collection,
  budget,
  season,
  temperatureF,
  limit = 10,
}: {
  catalog:
    FragranceRecord[];
  collection:
    CollectionItem[];
  budget?: number;
  season?: Season;
  temperatureF?: number;
  limit?: number;
}): RecommendationRunV2 {
  const pool =
    generateRecommendationCandidates({
      catalog,
      collection,
      budget,
    });

  const provisional:
    RecommendationCandidateV2[] =
      pool.map(
        (fragrance) => {
          const trace = [
            scorePreference({
              fragrance,
            }),
            scoreRoleGap({
              fragrance,
              collection,
              catalog,
            }),
            scoreOverlap({
              fragrance,
              collection,
              catalog,
            }),
            scoreWeather({
              fragrance,
              temperatureF,
            }),
            scoreSeason({
              fragrance,
              season,
            }),
            scoreBlindBuyRisk({
              fragrance,
            }),
            scoreBudget({
              fragrance,
              budget,
            }),
          ];

          const raw =
            55 +
            trace.reduce(
              (
                sum,
                step,
              ) =>
                sum +
                step.contribution,
              0,
            );

          const score =
            clamp(
              raw,
            );

          const confidence =
            clamp(
              trace.reduce(
                (
                  sum,
                  step,
                ) =>
                  sum +
                  step.confidence,
                0,
              ) /
                trace.length,
            );

          return {
            fragrance,
            score,
            confidence,
            trace,
            tradeoff:
              analyzeTradeoffs(
                trace,
              ),
            opportunityCost: {
              candidateId:
                fragrance.id,
              expectedGain:
                score,
              expectedLoss: 0,
              netGain:
                score,
              explanation:
                "Opportunity cost is calculated after candidate ranking.",
            },
          };
        },
      );

  const ranked =
    provisional
      .sort(
        (a, b) =>
          b.score -
          a.score ||
          b.confidence -
          a.confidence,
      )
      .slice(
        0,
        Math.max(
          limit,
          2,
        ),
      );

  const finalized =
    ranked.map(
      (candidate) => ({
        ...candidate,
        opportunityCost:
          calculateOpportunityCost({
            candidate,
            alternatives:
              ranked,
          }),
      }),
    );

  return {
    modelVersion:
      "NRE-2.0.0",
    generatedAt:
      new Date().toISOString(),
    candidatePoolSize:
      pool.length,
    candidates:
      finalized.slice(
        0,
        limit,
      ),
    reasoningDepth: 7,
    averageConfidence:
      finalized.length
        ? Math.round(
            finalized.reduce(
              (
                sum,
                item,
              ) =>
                sum +
                item.confidence,
              0,
            ) /
              finalized.length,
          )
        : 0,
  };
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        value,
      ),
    ),
  );
}
