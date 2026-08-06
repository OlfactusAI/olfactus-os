import type {
  NeuralCoreInput,
  NeuralCoreOutput,
} from "@/lib/intelligence/intelligence-engine";
import { runNeuralCore } from "@/lib/intelligence/intelligence-engine";
import { generateWearRecommendations } from "@/lib/intelligence/recommendation-engine";
import type { WeatherSnapshot } from "@/lib/weather/types";

export function runWeatherAwareNeuralCore(
  input: NeuralCoreInput,
  weather: WeatherSnapshot,
): NeuralCoreOutput & {
  context: {
    season: WeatherSnapshot["season"];
    temperatureF: number;
    humidity: number;
    desiredRole: "office";
    weatherSource: WeatherSnapshot["source"];
  };
} {
  const base = runNeuralCore(input);
  const context = {
    season: weather.season,
    temperatureF: weather.temperatureF,
    humidity: weather.humidity,
    desiredRole: "office" as const,
    weatherSource: weather.source,
  };

  const recommendations = generateWearRecommendations({
    owned: input.owned,
    context,
    now: input.now ?? new Date(),
  });

  return {
    ...base,
    context,
    activeSources: Array.from(
      new Set([
        ...base.activeSources,
        "Live Weather",
        "Humidity",
        "Apparent Temperature",
      ]),
    ),
    primaryRecommendation: recommendations.primary
      ? {
          fragranceId:
            recommendations.primary.fragranceId,
          fragranceName:
            recommendations.primary.fragranceName,
          explanation:
            recommendations.primary.summary,
          confidence:
            recommendations.primary.confidence,
          score: recommendations.primary.score,
          signals: recommendations.primary.signals,
        }
      : base.primaryRecommendation,
    alternativeRecommendations:
      recommendations.alternatives.map(
        (recommendation) => ({
          fragranceId:
            recommendation.fragranceId,
          fragranceName:
            recommendation.fragranceName,
          explanation: recommendation.summary,
          confidence: recommendation.confidence,
          score: recommendation.score,
          signals: recommendation.signals,
        }),
      ),
  } as NeuralCoreOutput & {
    context: {
      season: WeatherSnapshot["season"];
      temperatureF: number;
      humidity: number;
      desiredRole: "office";
      weatherSource: WeatherSnapshot["source"];
    };
  };
}
