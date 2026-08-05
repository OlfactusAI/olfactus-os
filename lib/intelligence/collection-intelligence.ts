import type {
  FragranceRecord,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";

export type CollectionInsightSeverity = "low" | "medium" | "high";
export type CollectionInsightCategory =
  | "coverage"
  | "season"
  | "rotation"
  | "concentration"
  | "identity"
  | "opportunity";

export interface CollectionIntelligenceOwnedItem {
  fragrance: FragranceRecord;
  item: {
    wearCount?: number;
    daysSinceLastWear: number;
  };
}

export interface CollectionHealthSnapshot {
  score: number;
  status: string;
  summary: string;
  confidence?: number;
}

export interface CollectionInsight {
  id: string;
  category: CollectionInsightCategory;
  severity: CollectionInsightSeverity;
  title: string;
  explanation: string;
  evidence: string[];
  action?: string;
  projectedImpact?: number;
}

export interface CollectionIntelligenceOutput {
  health: CollectionHealthSnapshot;

  collectionSize: number;
  totalWears: number;

  strongestSeason: {
    season: Season;
    score: number;
  } | null;

  weakestSeason: {
    season: Season;
    score: number;
  } | null;

  strongestRoles: {
    role: FragranceRole;
    coverage: number;
  }[];

  missingRoles: FragranceRole[];

  neglectedFragrances: {
    fragranceId: string;
    fragranceName: string;
    daysSinceLastWear: number;
  }[];

  dominantFamilies: {
    family: string;
    count: number;
    percentage: number;
  }[];

  insights: CollectionInsight[];
  priorityInsight: CollectionInsight | null;

  confidence: number;
  generatedAt: string;
  modelVersion: "CIE-1.0.0";
}

interface CollectionIntelligenceInput {
  owned: CollectionIntelligenceOwnedItem[];
  health: CollectionHealthSnapshot;
  now?: Date;
}

const trackedRoles: FragranceRole[] = [
  "office",
  "casual",
  "date",
  "formal",
  "summer",
  "winter",
  "creative",
  "signature",
  "travel",
];

const seasons: Season[] = ["spring", "summer", "fall", "winter"];

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, value));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function calculateSeasonScores(
  owned: CollectionIntelligenceOwnedItem[],
): Record<Season, number> {
  return seasons.reduce(
    (result, season) => {
      const strongestOptions = owned
        .map(({ fragrance }) => fragrance.seasons[season])
        .sort((a, b) => b - a)
        .slice(0, 3);

      result[season] = Math.round(average(strongestOptions));

      return result;
    },
    {
      spring: 0,
      summer: 0,
      fall: 0,
      winter: 0,
    } satisfies Record<Season, number>,
  );
}

function calculateRoleCoverage(
  owned: CollectionIntelligenceOwnedItem[],
): Record<FragranceRole, number> {
  return trackedRoles.reduce(
    (result, role) => {
      const matchingFragrances = owned.filter(({ fragrance }) =>
        fragrance.roles.includes(role),
      ).length;

      result[role] = clamp(
        matchingFragrances === 0
          ? 0
          : matchingFragrances === 1
            ? 68
            : matchingFragrances === 2
              ? 88
              : 100,
      );

      return result;
    },
    {} as Record<FragranceRole, number>,
  );
}

function calculateDominantFamilies(
  owned: CollectionIntelligenceOwnedItem[],
) {
  const familyCounts = new Map<string, number>();

  owned.forEach(({ fragrance }) => {
    familyCounts.set(
      fragrance.family,
      (familyCounts.get(fragrance.family) ?? 0) + 1,
    );
  });

  return [...familyCounts.entries()]
    .map(([family, count]) => ({
      family,
      count,
      percentage:
        owned.length === 0
          ? 0
          : Math.round((count / owned.length) * 100),
    }))
    .sort(
      (a, b) =>
        b.count - a.count || a.family.localeCompare(b.family),
    );
}

function buildInsights({
  owned,
  weakestSeason,
  missingRoles,
  neglectedFragrances,
  dominantFamilies,
}: {
  owned: CollectionIntelligenceOwnedItem[];
  weakestSeason: {
    season: Season;
    score: number;
  } | null;
  missingRoles: FragranceRole[];
  neglectedFragrances: {
    fragranceId: string;
    fragranceName: string;
    daysSinceLastWear: number;
  }[];
  dominantFamilies: {
    family: string;
    count: number;
    percentage: number;
  }[];
}): CollectionInsight[] {
  const insights: CollectionInsight[] = [];

  if (missingRoles.length > 0) {
    const priorityRole = missingRoles[0];

    insights.push({
      id: `missing-role-${priorityRole}`,
      category: "coverage",
      severity: "high",
      title: `${priorityRole} coverage is missing`,
      explanation: `Your collection does not currently contain a clear fragrance for the ${priorityRole} role.`,
      evidence: missingRoles,
      action: `Explore one fragrance designed for the ${priorityRole} role.`,
      projectedImpact: 4,
    });
  }

  if (weakestSeason && weakestSeason.score < 70) {
    insights.push({
      id: `weak-season-${weakestSeason.season}`,
      category: "season",
      severity: weakestSeason.score < 50 ? "high" : "medium",
      title: `${weakestSeason.season} is your weakest season`,
      explanation: `Your best available options average only ${weakestSeason.score}/100 for ${weakestSeason.season}.`,
      evidence: [`Season score: ${weakestSeason.score}`],
      action: `Strengthen ${weakestSeason.season} coverage with a distinct role rather than a duplicate.`,
      projectedImpact: 3,
    });
  }

  if (neglectedFragrances.length > 0) {
    const mostNeglected = neglectedFragrances[0];

    insights.push({
      id: `rotation-${mostNeglected.fragranceId}`,
      category: "rotation",
      severity:
        mostNeglected.daysSinceLastWear >= 60 ? "high" : "medium",
      title: `${mostNeglected.fragranceName} needs attention`,
      explanation: `It has not been worn in ${mostNeglected.daysSinceLastWear} days.`,
      evidence: neglectedFragrances
        .slice(0, 3)
        .map(
          (item) =>
            `${item.fragranceName}: ${item.daysSinceLastWear} days`,
        ),
      action: `Wear ${mostNeglected.fragranceName} during an appropriate upcoming occasion.`,
      projectedImpact: 2,
    });
  }

  const dominantFamily = dominantFamilies[0];

  if (
    dominantFamily &&
    owned.length >= 4 &&
    dominantFamily.percentage >= 40
  ) {
    insights.push({
      id: `family-concentration-${dominantFamily.family}`,
      category: "concentration",
      severity:
        dominantFamily.percentage >= 60 ? "high" : "medium",
      title: `${dominantFamily.family} is heavily concentrated`,
      explanation: `${dominantFamily.percentage}% of your collection belongs to this family.`,
      evidence: [
        `${dominantFamily.count} of ${owned.length} fragrances`,
      ],
      action: `Avoid another ${dominantFamily.family} fragrance unless it creates a genuinely new role.`,
      projectedImpact: 0,
    });
  }

  if (owned.length > 0 && missingRoles.length <= 2) {
    insights.push({
      id: "collection-foundation",
      category: "identity",
      severity: "low",
      title: "Your collection has a recognizable foundation",
      explanation:
        "Most core roles are covered, allowing future purchases to prioritize individuality rather than necessity.",
      evidence: [
        `${trackedRoles.length - missingRoles.length} of ${trackedRoles.length} tracked roles covered`,
      ],
      action:
        "Prioritize fragrances with distinctive DNA and low functional overlap.",
      projectedImpact: 1,
    });
  }

  return insights;
}

export function analyzeCollectionIntelligence({
  owned,
  health,
  now = new Date(),
}: CollectionIntelligenceInput): CollectionIntelligenceOutput {
  const seasonScores = calculateSeasonScores(owned);
  const roleCoverage = calculateRoleCoverage(owned);

  const rankedSeasons = seasons
    .map((season) => ({
      season,
      score: seasonScores[season],
    }))
    .sort((a, b) => b.score - a.score);

  const strongestSeason = rankedSeasons[0] ?? null;
  const weakestSeason =
    rankedSeasons[rankedSeasons.length - 1] ?? null;

  const rankedRoles = trackedRoles
    .map((role) => ({
      role,
      coverage: roleCoverage[role],
    }))
    .sort(
      (a, b) =>
        b.coverage - a.coverage ||
        a.role.localeCompare(b.role),
    );

  const strongestRoles = rankedRoles
    .filter(({ coverage }) => coverage >= 88)
    .slice(0, 4);

  const missingRoles = rankedRoles
    .filter(({ coverage }) => coverage === 0)
    .map(({ role }) => role);

  const neglectedFragrances = owned
    .filter(({ item }) => item.daysSinceLastWear >= 30)
    .map(({ fragrance, item }) => ({
      fragranceId: fragrance.id,
      fragranceName: `${fragrance.brand} ${fragrance.name}`,
      daysSinceLastWear: item.daysSinceLastWear,
    }))
    .sort(
      (a, b) =>
        b.daysSinceLastWear - a.daysSinceLastWear,
    );

  const dominantFamilies = calculateDominantFamilies(owned);

  const insights = buildInsights({
    owned,
    weakestSeason,
    missingRoles,
    neglectedFragrances,
    dominantFamilies,
  });

  const totalWears = owned.reduce(
    (total, { item }) => total + (item.wearCount ?? 0),
    0,
  );

  const dataDepth =
    owned.length === 0
      ? 25
      : Math.min(
          100,
          55 +
            owned.length * 4 +
            Math.min(totalWears, 100) * 0.15,
        );

  const healthConfidence = health.confidence ?? 85;

  const confidence = Math.round(
    clamp(healthConfidence * 0.6 + dataDepth * 0.4),
  );

  return {
    health,
    collectionSize: owned.length,
    totalWears,
    strongestSeason,
    weakestSeason,
    strongestRoles,
    missingRoles,
    neglectedFragrances,
    dominantFamilies,
    insights,
    priorityInsight: insights[0] ?? null,
    confidence,
    generatedAt: now.toISOString(),
    modelVersion: "CIE-1.0.0",
  };
}