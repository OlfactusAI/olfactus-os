import type {
  OlfactusIntelligenceApi,
} from "@/lib/intelligence-api";
import {
  generateWearRecommendations,
  type RecommendationContext,
  type RecommendationEngineOutput,
} from "@/lib/intelligence/recommendation-engine";

export interface UnifiedRecommendationOutput
  extends Omit<
    RecommendationEngineOutput,
    "modelVersion"
  > {
  modelVersion:
    "RE-4.1.0";
  collectorStateVersion:
    "COLLECTOR-STATE-1.0.0";
}

export function generateUnifiedWearRecommendations({
  api,
  context,
  now,
}: {
  api:
    OlfactusIntelligenceApi;
  context:
    RecommendationContext;
  now?: Date;
}): UnifiedRecommendationOutput {
  const state =
    api.getCollectorState();
  const owned =
    api.getOwnedFragrances();

  const base =
    generateWearRecommendations({
      owned: owned.map(
        ({ fragrance, item }) => ({
          fragrance,
          item: {
            wearCount:
              item.wearCount,
            daysSinceLastWear:
              item.daysSinceLastWear,
          },
        }),
      ),
      context,
      now,
    });

  const future =
    state.prediction
      .collectionForecast
      .points.find(
        (point) =>
          point.horizon ===
          "90d",
      );

  const stateById =
    new Map(
      (
        future
          ?.bottleStates ??
        []
      ).map(
        (item) => [
          item.fragranceId,
          item,
        ],
      ),
    );

  const reranked =
    [
      ...(base.primary
        ? [
            base.primary,
          ]
        : []),
      ...base.alternatives,
    ]
      .map(
        (recommendation) => {
          const futureState =
            stateById.get(
              recommendation
                .fragranceId,
            );

          const futureBonus =
            futureState
              ?.state ===
              "neglect-risk"
              ? 8
              : futureState
                    ?.state ===
                  "watch"
                ? 5
                : futureState
                      ?.state ===
                    "core-rotation"
                  ? -2
                  : 0;

          const personalGraph =
            api.getFragranceState(
              recommendation
                .fragranceId,
            );

          const wearEvidence =
            personalGraph
              .relationships.find(
                (edge) =>
                  edge.type ===
                  "wore",
              )
              ?.evidenceCount ??
            0;

          const adjustedScore =
            Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  recommendation.score +
                    futureBonus +
                    Math.min(
                      3,
                      wearEvidence *
                        0.2,
                    ),
                ),
              ),
            );

          return {
            ...recommendation,
            score:
              adjustedScore,
            summary:
              `${recommendation.summary}${
                futureBonus > 0
                  ? ` Personal forecast adds rotation priority because this bottle is trending toward ${futureState?.state.replaceAll("-", " ")}.`
                  : ""
              }`,
          };
        },
      )
      .sort(
        (a, b) =>
          b.score -
            a.score ||
          b.confidence -
            a.confidence,
      );

  return {
    primary:
      reranked[0] ??
      null,
    alternatives:
      reranked.slice(
        1,
        4,
      ),
    generatedAt:
      base.generatedAt,
    modelVersion:
      "RE-4.1.0",
    collectorStateVersion:
      "COLLECTOR-STATE-1.0.0",
  };
}
