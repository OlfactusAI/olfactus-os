import type {
  FragranceRecord,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";

export interface RecommendationCollectionItem {
  fragrance: FragranceRecord;
  item: {
    wearCount?: number;
    daysSinceLastWear: number;
  };
}

export interface RecommendationContext {
  season: Season;
  temperatureF?: number;
  humidity?: number;
  desiredRole?: FragranceRole;
  occasion?: string;
}

export interface RecommendationSignal {
  id:
    | "season"
    | "weather"
    | "role"
    | "rotation"
    | "performance"
    | "data-quality";
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

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, value));
}

function intelligenceConfidence(fragrance: FragranceRecord) {
  if (fragrance.intelligence?.confidence !== undefined) {
    return fragrance.intelligence.confidence;
  }

  switch (fragrance.intelligenceStatus) {
    case "validated":
      return 96;
    case "calibration":
      return 86;
    case "draft":
      return 62;
  }
}

function getWeatherScore(
  fragrance: FragranceRecord,
  context: RecommendationContext,
) {
  const temperature = context.temperatureF;
  const humidity = context.humidity;

  if (temperature === undefined && humidity === undefined) {
    return fragrance.seasons[context.season];
  }

  let score = fragrance.seasons[context.season];

  if (temperature !== undefined) {
    if (temperature >= 88) {
      score = fragrance.climate?.highHeat ?? fragrance.seasons.summer;
    } else if (temperature <= 48) {
      score = fragrance.climate?.cold ?? fragrance.seasons.winter;
    }
  }

  if (humidity !== undefined && humidity >= 70) {
    const humidityScore =
      fragrance.climate?.humidity ??
      Math.round(
        fragrance.dna.fresh * 0.55 +
          fragrance.dna.green * 0.25 +
          (100 - fragrance.dna.sweet) * 0.2,
      );

    score = score * 0.7 + humidityScore * 0.3;
  }

  return Math.round(clamp(score));
}

function getRoleScore(
  fragrance: FragranceRecord,
  desiredRole?: FragranceRole,
) {
  if (!desiredRole) {
    return 75;
  }

  return fragrance.roles.includes(desiredRole) ? 100 : 38;
}

function getRotationScore(daysSinceLastWear: number) {
  if (daysSinceLastWear >= 45) return 100;
  if (daysSinceLastWear >= 30) return 94;
  if (daysSinceLastWear >= 21) return 87;
  if (daysSinceLastWear >= 14) return 78;
  if (daysSinceLastWear >= 7) return 66;
  if (daysSinceLastWear >= 3) return 48;

  return 24;
}

function getPerformanceScore(fragrance: FragranceRecord) {
  const projection = fragrance.performance.projection;
  const longevity = fragrance.performance.longevity;
  const consistency = fragrance.performance.consistency ?? 75;

  return Math.round(
    clamp(projection * 0.3 + longevity * 0.45 + consistency * 0.25),
  );
}

function analyzeCandidate(
  owned: RecommendationCollectionItem,
  context: RecommendationContext,
): WearRecommendation {
  const { fragrance, item } = owned;

  const seasonScore = fragrance.seasons[context.season];
  const weatherScore = getWeatherScore(fragrance, context);
  const roleScore = getRoleScore(fragrance, context.desiredRole);
  const rotationScore = getRotationScore(item.daysSinceLastWear);
  const performanceScore = getPerformanceScore(fragrance);
  const dataQualityScore = intelligenceConfidence(fragrance);

  const signals: RecommendationSignal[] = [
    {
      id: "season",
      label: "Season suitability",
      score: seasonScore,
      weight: 0.2,
      explanation: `${fragrance.name} scores ${seasonScore}/100 for ${context.season}.`,
    },
    {
      id: "weather",
      label: "Weather compatibility",
      score: weatherScore,
      weight: 0.25,
      explanation:
        context.temperatureF !== undefined
          ? `Evaluated for ${context.temperatureF}°F${
              context.humidity !== undefined
                ? ` and ${context.humidity}% humidity`
                : ""
            }.`
          : `Weather suitability currently uses its ${context.season} profile.`,
    },
    {
      id: "role",
      label: "Role alignment",
      score: roleScore,
      weight: 0.2,
      explanation: context.desiredRole
        ? fragrance.roles.includes(context.desiredRole)
          ? `Directly supports the ${context.desiredRole} role.`
          : `Does not primarily serve the ${context.desiredRole} role.`
        : "No specific role was requested.",
    },
    {
      id: "rotation",
      label: "Rotation priority",
      score: rotationScore,
      weight: 0.2,
      explanation:
        item.daysSinceLastWear === 0
          ? "Worn today."
          : `Last worn ${item.daysSinceLastWear} days ago.`,
    },
    {
      id: "performance",
      label: "Performance reliability",
      score: performanceScore,
      weight: 0.1,
      explanation: `Projection ${fragrance.performance.projection}, longevity ${fragrance.performance.longevity}.`,
    },
    {
      id: "data-quality",
      label: "Intelligence quality",
      score: dataQualityScore,
      weight: 0.05,
      explanation: `Record status: ${fragrance.intelligenceStatus}.`,
    },
  ];

  const score = Math.round(
    signals.reduce(
      (total, signal) => total + signal.score * signal.weight,
      0,
    ),
  );

  const confidence = Math.round(
    clamp(dataQualityScore * 0.6 + Math.min(100, signals.length * 7) * 0.4),
  );

  const strongestSignals = [...signals]
    .filter((signal) => signal.id !== "data-quality")
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return {
    fragranceId: fragrance.id,
    fragranceName: `${fragrance.brand} ${fragrance.name}`,
    score,
    confidence,
    summary: strongestSignals
      .map((signal) => signal.explanation)
      .join(" "),
    signals,
  };
}

export function generateWearRecommendations({
  owned,
  context,
  now = new Date(),
}: RecommendationEngineInput): RecommendationEngineOutput {
  const ranked = owned
    .map((item) => analyzeCandidate(item, context))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.confidence - a.confidence ||
        a.fragranceName.localeCompare(b.fragranceName),
    );

  return {
    primary: ranked[0] ?? null,
    alternatives: ranked.slice(1, 4),
    generatedAt: now.toISOString(),
    modelVersion: "RE-2.0.0",
  };
}