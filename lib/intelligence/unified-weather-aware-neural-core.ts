import type {
  OlfactusIntelligenceApi,
} from "@/lib/intelligence-api";
import {
  runNeuralCore,
  type NeuralCoreOutput,
} from "@/lib/intelligence/intelligence-engine";
import {
  generateUnifiedWearRecommendations,
} from "@/lib/intelligence/unified-recommendation-engine";
import type {
  WeatherSnapshot,
} from "@/lib/weather/types";

export function runUnifiedWeatherAwareNeuralCore({
  api,
  weather,
  hydrated,
  now,
}: {
  api:
    OlfactusIntelligenceApi;
  weather:
    WeatherSnapshot;
  hydrated: boolean;
  now?: Date;
}): NeuralCoreOutput & {
  context: {
    season:
      WeatherSnapshot["season"];
    temperatureF: number;
    humidity: number;
    desiredRole:
      "office";
    weatherSource:
      WeatherSnapshot["source"];
  };
  recommendationModel:
    "RE-4.1.0";
} {
  const analysis =
    api.getCollectionHealthContext();
  const owned =
    api.getOwnedFragrances();
  const base =
    runNeuralCore({
      analysis,
      owned,
      hydrated,
      now,
    });

  const context = {
    season:
      weather.season,
    temperatureF:
      weather.temperatureF,
    humidity:
      weather.humidity,
    desiredRole:
      "office" as const,
    weatherSource:
      weather.source,
  };

  const recommendations =
    generateUnifiedWearRecommendations({
      api,
      context,
      now,
    });

  return {
    ...base,
    context,
    activeSources:
      Array.from(
        new Set([
          ...base.activeSources,
          "Canonical Collector State",
          "Personal Intelligence Graph",
          "Live Weather",
          "Humidity",
          "Apparent Temperature",
        ]),
      ),
    primaryRecommendation:
      recommendations.primary
        ? {
            fragranceId:
              recommendations.primary
                .fragranceId,
            fragranceName:
              recommendations.primary
                .fragranceName,
            explanation:
              recommendations.primary
                .summary,
            confidence:
              recommendations.primary
                .confidence,
            score:
              recommendations.primary
                .score,
            signals:
              recommendations.primary
                .signals,
          }
        : base.primaryRecommendation,
    alternativeRecommendations:
      recommendations
        .alternatives.map(
          (recommendation) => ({
            fragranceId:
              recommendation
                .fragranceId,
            fragranceName:
              recommendation
                .fragranceName,
            explanation:
              recommendation
                .summary,
            confidence:
              recommendation
                .confidence,
            score:
              recommendation
                .score,
            signals:
              recommendation
                .signals,
          }),
        ),
    recommendationModel:
      "RE-4.1.0",
  };
}
