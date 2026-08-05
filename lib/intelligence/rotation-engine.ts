import type {
  FragranceRecord,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";

export interface RotationOwnedFragrance {
  fragrance: FragranceRecord;

  item: {
    wearCount?: number;
    daysSinceLastWear: number;
  };
}

export interface RotationContext {
  season: Season;
  desiredRole?: FragranceRole;
  recentWearIds?: string[];
}

export interface RotationCandidate {
  fragranceId: string;
  fragranceName: string;
  score: number;

  daysSinceLastWear: number;
  wearCount: number;

  reasons: string[];
}

export interface RotationAlert {
  type:
    | "neglected"
    | "overused"
    | "season-mismatch"
    | "concentrated-rotation";

  severity: "low" | "medium" | "high";
  title: string;
  explanation: string;
  fragranceIds: string[];
}

export interface RotationEngineOutput {
  healthScore: number;
  status: "healthy" | "imbalanced" | "needs-attention";

  nextWear: RotationCandidate | null;
  alternatives: RotationCandidate[];

  neglected: RotationCandidate[];
  overused: RotationCandidate[];

  alerts: RotationAlert[];

  totalWears: number;
  activeRotationSize: number;

  confidence: number;
  generatedAt: string;
  modelVersion: "ROE-1.0.0";
}

interface RotationEngineInput {
  owned: RotationOwnedFragrance[];
  context: RotationContext;
  now?: Date;
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getRecencyScore(daysSinceLastWear: number) {
  if (daysSinceLastWear >= 60) return 100;
  if (daysSinceLastWear >= 45) return 96;
  if (daysSinceLastWear >= 30) return 90;
  if (daysSinceLastWear >= 21) return 82;
  if (daysSinceLastWear >= 14) return 72;
  if (daysSinceLastWear >= 7) return 58;
  if (daysSinceLastWear >= 3) return 38;

  return 18;
}

function getSeasonScore(
  fragrance: FragranceRecord,
  season: Season,
) {
  return fragrance.seasons[season];
}

function getRoleScore(
  fragrance: FragranceRecord,
  desiredRole?: FragranceRole,
) {
  if (!desiredRole) {
    return 75;
  }

  return fragrance.roles.includes(desiredRole) ? 100 : 40;
}

function getRecentWearPenalty(
  fragranceId: string,
  recentWearIds: string[],
) {
  const appearances = recentWearIds.filter(
    (id) => id === fragranceId,
  ).length;

  return clamp(appearances * 18, 0, 60);
}

function createCandidate(
  owned: RotationOwnedFragrance,
  context: RotationContext,
): RotationCandidate {
  const { fragrance, item } = owned;

  const wearCount = item.wearCount ?? 0;
  const recencyScore = getRecencyScore(item.daysSinceLastWear);
  const seasonScore = getSeasonScore(fragrance, context.season);
  const roleScore = getRoleScore(
    fragrance,
    context.desiredRole,
  );

  const recentWearPenalty = getRecentWearPenalty(
    fragrance.id,
    context.recentWearIds ?? [],
  );

  const score = Math.round(
    clamp(
      recencyScore * 0.45 +
        seasonScore * 0.35 +
        roleScore * 0.2 -
        recentWearPenalty,
    ),
  );

  const reasons: string[] = [];

  if (item.daysSinceLastWear >= 30) {
    reasons.push(
      `Not worn in ${item.daysSinceLastWear} days`,
    );
  } else if (item.daysSinceLastWear >= 14) {
    reasons.push(
      `Rotation priority after ${item.daysSinceLastWear} days`,
    );
  }

  if (seasonScore >= 85) {
    reasons.push(
      `Excellent ${context.season} suitability`,
    );
  }

  if (
    context.desiredRole &&
    fragrance.roles.includes(context.desiredRole)
  ) {
    reasons.push(
      `Directly supports the ${context.desiredRole} role`,
    );
  }

  if (recentWearPenalty >= 18) {
    reasons.push(
      "Recently worn and slightly deprioritized",
    );
  }

  if (reasons.length === 0) {
    reasons.push("Balanced rotation candidate");
  }

  return {
    fragranceId: fragrance.id,
    fragranceName: `${fragrance.brand} ${fragrance.name}`,
    score,
    daysSinceLastWear: item.daysSinceLastWear,
    wearCount,
    reasons,
  };
}

export function optimizeRotation({
  owned,
  context,
  now = new Date(),
}: RotationEngineInput): RotationEngineOutput {
  const candidates = owned
    .map((item) => createCandidate(item, context))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.daysSinceLastWear - a.daysSinceLastWear ||
        a.fragranceName.localeCompare(b.fragranceName),
    );

  const totalWears = candidates.reduce(
    (total, candidate) =>
      total + candidate.wearCount,
    0,
  );

  const averageWears =
    candidates.length === 0
      ? 0
      : totalWears / candidates.length;

  const neglected = candidates
    .filter(
      (candidate) =>
        candidate.daysSinceLastWear >= 30,
    )
    .sort(
      (a, b) =>
        b.daysSinceLastWear - a.daysSinceLastWear,
    );

  const overused = candidates
    .filter(
      (candidate) =>
        averageWears > 0 &&
        candidate.wearCount >= averageWears * 1.75,
    )
    .sort(
      (a, b) => b.wearCount - a.wearCount,
    );

  const activeRotationSize = candidates.filter(
    (candidate) =>
      candidate.daysSinceLastWear <= 21,
  ).length;

  const alerts: RotationAlert[] = [];

  if (neglected.length > 0) {
    alerts.push({
      type: "neglected",
      severity:
        neglected[0].daysSinceLastWear >= 60
          ? "high"
          : "medium",
      title: `${neglected.length} fragrance${
        neglected.length === 1 ? "" : "s"
      } need rotation attention`,
      explanation: `${neglected[0].fragranceName} has been unused the longest at ${neglected[0].daysSinceLastWear} days.`,
      fragranceIds: neglected.map(
        (candidate) => candidate.fragranceId,
      ),
    });
  }

  if (overused.length > 0) {
    alerts.push({
      type: "overused",
      severity: "medium",
      title: "Wear is concentrated around a few fragrances",
      explanation: `${overused[0].fragranceName} is being worn substantially more often than the collection average.`,
      fragranceIds: overused.map(
        (candidate) => candidate.fragranceId,
      ),
    });
  }

  if (
    candidates.length >= 5 &&
    activeRotationSize <=
      Math.max(2, Math.floor(candidates.length * 0.35))
  ) {
    alerts.push({
      type: "concentrated-rotation",
      severity: "high",
      title: "Your active rotation is too narrow",
      explanation: `Only ${activeRotationSize} of ${candidates.length} fragrances have been worn within the last 21 days.`,
      fragranceIds: candidates
        .filter(
          (candidate) =>
            candidate.daysSinceLastWear <= 21,
        )
        .map(
          (candidate) => candidate.fragranceId,
        ),
    });
  }

  const neglectPenalty =
    candidates.length === 0
      ? 0
      : (neglected.length / candidates.length) * 45;

  const overusePenalty =
    candidates.length === 0
      ? 0
      : (overused.length / candidates.length) * 30;

  const concentrationPenalty =
    candidates.length === 0
      ? 0
      : activeRotationSize <
          candidates.length * 0.5
        ? 15
        : 0;

  const healthScore = Math.round(
    clamp(
      100 -
        neglectPenalty -
        overusePenalty -
        concentrationPenalty,
    ),
  );

  const status: RotationEngineOutput["status"] =
    healthScore >= 82
      ? "healthy"
      : healthScore >= 62
        ? "imbalanced"
        : "needs-attention";

  const dataDepth =
    candidates.length === 0
      ? 35
      : clamp(
          60 +
            candidates.length * 4 +
            Math.min(totalWears, 100) * 0.12,
        );

  return {
    healthScore,
    status,

    nextWear: candidates[0] ?? null,
    alternatives: candidates.slice(1, 4),

    neglected,
    overused,
    alerts,

    totalWears,
    activeRotationSize,

    confidence: Math.round(dataDepth),
    generatedAt: now.toISOString(),
    modelVersion: "ROE-1.0.0",
  };
}