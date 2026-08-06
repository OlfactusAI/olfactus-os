import type { CollectionHealthAnalysis } from "@/lib/domain/analysis";
import type {
  DnaDimension,
  FragranceRecord,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";

const dnaDimensions: DnaDimension[] = [
  "fresh",
  "green",
  "woody",
  "amber",
  "sweet",
  "dark",
  "artistic",
  "formal",
];

const seasons: Season[] = ["spring", "summer", "fall", "winter"];

export type CollectorArchetype =
  | "strategic-explorer"
  | "signature-loyalist"
  | "performance-curator"
  | "versatility-builder"
  | "artistic-discoverer"
  | "value-optimizer";

export interface ProfilePreferences {
  preferredSeason: Season;
  preferredRole: FragranceRole;
  minimumLongevity: number;
  riskTolerance: number;
  budgetCeiling: number;
  adventurousness: number;
  marketPreference: "balanced" | "designer" | "niche";
}

export interface TasteGenomeDimension {
  dimension: DnaDimension;
  value: number;
}

export interface WearAnalytics {
  totalWears: number;
  utilizationRate: number;
  averageWearsPerBottle: number;
  rotationConsistency: number;
  mostWorn: Array<{
    fragranceId: string;
    fragranceName: string;
    wears: number;
  }>;
  leastWorn: Array<{
    fragranceId: string;
    fragranceName: string;
    wears: number;
  }>;
  favoriteRoles: Array<{
    role: FragranceRole;
    score: number;
  }>;
  preferredSeason: Season;
}

export interface PurchasePersonality {
  primary: string;
  traits: string[];
  disciplineScore: number;
  explorationScore: number;
  valueOrientation: number;
  explanation: string;
}

export interface ProfileIntelligenceOutput {
  modelVersion: "PI-1.0.0";
  archetype: CollectorArchetype;
  archetypeLabel: string;
  identityStatement: string;
  tasteGenome: TasteGenomeDimension[];
  wearAnalytics: WearAnalytics;
  purchasePersonality: PurchasePersonality;
  preferenceAlignment: number;
  milestones: Array<{
    id: string;
    label: string;
    value: string;
    completed: boolean;
  }>;
}

export interface ProfileIntelligenceInput {
  owned: Array<{
    fragrance: FragranceRecord;
    wearCount: number;
    favorite: boolean;
    daysSinceLastWear: number;
  }>;
  analysis: CollectionHealthAnalysis;
  preferences: ProfilePreferences;
  completedCoachActions: number;
}

export const defaultProfilePreferences: ProfilePreferences = {
  preferredSeason: "summer",
  preferredRole: "office",
  minimumLongevity: 75,
  riskTolerance: 35,
  budgetCeiling: 250,
  adventurousness: 65,
  marketPreference: "balanced",
};

export function analyzeProfileIntelligence({
  owned,
  analysis,
  preferences,
  completedCoachActions,
}: ProfileIntelligenceInput): ProfileIntelligenceOutput {
  const tasteGenome = buildTasteGenome(owned);
  const wearAnalytics = buildWearAnalytics(owned);
  const purchasePersonality = buildPurchasePersonality({
    owned,
    analysis,
    preferences,
  });
  const archetype = determineArchetype({
    tasteGenome,
    wearAnalytics,
    analysis,
    preferences,
  });

  return {
    modelVersion: "PI-1.0.0",
    archetype,
    archetypeLabel: formatArchetype(archetype),
    identityStatement: buildIdentityStatement({
      archetype,
      tasteGenome,
      wearAnalytics,
      preferences,
    }),
    tasteGenome,
    wearAnalytics,
    purchasePersonality,
    preferenceAlignment: calculatePreferenceAlignment({
      owned,
      preferences,
    }),
    milestones: [
      {
        id: "health-90",
        label: "Collection Health 90+",
        value: `${analysis.score}/100`,
        completed: analysis.score >= 90,
      },
      {
        id: "rotation-85",
        label: "Rotation Health 85+",
        value: `${analysis.dimensions.rotation}/100`,
        completed: analysis.dimensions.rotation >= 85,
      },
      {
        id: "ten-actions",
        label: "Complete 10 Coach Actions",
        value: `${completedCoachActions}/10`,
        completed: completedCoachActions >= 10,
      },
      {
        id: "utilization-70",
        label: "Use 70% of Collection",
        value: `${wearAnalytics.utilizationRate}%`,
        completed: wearAnalytics.utilizationRate >= 70,
      },
    ],
  };
}

function buildTasteGenome(
  owned: ProfileIntelligenceInput["owned"],
): TasteGenomeDimension[] {
  const totalWeight =
    owned.reduce(
      (sum, item) => sum + Math.max(1, item.wearCount),
      0,
    ) || 1;

  return dnaDimensions
    .map((dimension) => ({
      dimension,
      value: Math.round(
        owned.reduce(
          (sum, item) =>
            sum +
            item.fragrance.dna[dimension] *
              Math.max(1, item.wearCount),
          0,
        ) / totalWeight,
      ),
    }))
    .sort((a, b) => b.value - a.value);
}

function buildWearAnalytics(
  owned: ProfileIntelligenceInput["owned"],
): WearAnalytics {
  const totalWears = owned.reduce(
    (sum, item) => sum + item.wearCount,
    0,
  );
  const used = owned.filter((item) => item.wearCount > 0);
  const utilizationRate = owned.length
    ? Math.round((used.length / owned.length) * 100)
    : 0;

  const roleScores = new Map<FragranceRole, number>();
  for (const item of owned) {
    for (const role of item.fragrance.roles) {
      roleScores.set(
        role,
        (roleScores.get(role) ?? 0) +
          Math.max(1, item.wearCount),
      );
    }
  }

  const seasonScores = seasons.map((season) => ({
    season,
    score: owned.reduce(
      (sum, item) =>
        sum +
        item.fragrance.seasons[season] *
          Math.max(1, item.wearCount),
      0,
    ),
  }));

  return {
    totalWears,
    utilizationRate,
    averageWearsPerBottle: owned.length
      ? Math.round((totalWears / owned.length) * 10) / 10
      : 0,
    rotationConsistency: Math.round(
      clamp(
        utilizationRate * 0.62 +
          Math.min(100, totalWears * 2.4) * 0.38,
      ),
    ),
    mostWorn: [...owned]
      .sort((a, b) => b.wearCount - a.wearCount)
      .slice(0, 3)
      .map((item) => ({
        fragranceId: item.fragrance.id,
        fragranceName: item.fragrance.name,
        wears: item.wearCount,
      })),
    leastWorn: [...owned]
      .sort((a, b) => a.wearCount - b.wearCount)
      .slice(0, 3)
      .map((item) => ({
        fragranceId: item.fragrance.id,
        fragranceName: item.fragrance.name,
        wears: item.wearCount,
      })),
    favoriteRoles: [...roleScores.entries()]
      .map(([role, score]) => ({ role, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4),
    preferredSeason:
      seasonScores.sort((a, b) => b.score - a.score)[0]?.season ??
      "summer",
  };
}

function buildPurchasePersonality({
  owned,
  analysis,
  preferences,
}: {
  owned: ProfileIntelligenceInput["owned"];
  analysis: CollectionHealthAnalysis;
  preferences: ProfilePreferences;
}): PurchasePersonality {
  const averageValue = owned.length
    ? owned.reduce(
        (sum, item) =>
          sum + (item.fragrance.market?.valueScore ?? 70),
        0,
      ) / owned.length
    : 70;

  const explorationScore = Math.round(
    clamp(
      analysis.dimensions.diversity * 0.55 +
        preferences.adventurousness * 0.45,
    ),
  );
  const disciplineScore = Math.round(
    clamp(
      analysis.dimensions.redundancy * 0.45 +
        analysis.dimensions.rotation * 0.35 +
        (100 - preferences.riskTolerance) * 0.2,
    ),
  );
  const valueOrientation = Math.round(
    clamp(
      averageValue * 0.65 +
        Math.max(
          0,
          100 - preferences.budgetCeiling / 6,
        ) *
          0.35,
    ),
  );

  const primary =
    disciplineScore >= 82
      ? "Strategic Buyer"
      : explorationScore >= 82
        ? "Variety Seeker"
        : valueOrientation >= 82
          ? "Value Conscious"
          : analysis.dimensions.identity >= 85
            ? "Signature Loyalist"
            : "Balanced Curator";

  return {
    primary,
    traits: [
      explorationScore >= 75
        ? "Open to new DNA"
        : "Prefers familiar profiles",
      disciplineScore >= 75
        ? "Intentional purchasing"
        : "Impulse risk present",
      valueOrientation >= 75
        ? "Value aware"
        : "Luxury-first",
    ],
    disciplineScore,
    explorationScore,
    valueOrientation,
    explanation: `${primary} behavior is driven by ${disciplineScore}/100 purchase discipline, ${explorationScore}/100 exploration, and ${valueOrientation}/100 value orientation.`,
  };
}

function determineArchetype({
  tasteGenome,
  wearAnalytics,
  analysis,
  preferences,
}: {
  tasteGenome: TasteGenomeDimension[];
  wearAnalytics: WearAnalytics;
  analysis: CollectionHealthAnalysis;
  preferences: ProfilePreferences;
}): CollectorArchetype {
  if (
    analysis.dimensions.identity >= 88 &&
    wearAnalytics.mostWorn[0]?.wears >= 8
  ) {
    return "signature-loyalist";
  }
  if (
    preferences.minimumLongevity >= 85 ||
    tasteGenome.find((item) => item.dimension === "formal")!.value >= 80
  ) {
    return "performance-curator";
  }
  if (
    preferences.adventurousness >= 78 ||
    tasteGenome.find((item) => item.dimension === "artistic")!.value >= 78
  ) {
    return "artistic-discoverer";
  }
  if (analysis.dimensions.roleCoverage >= 88) {
    return "versatility-builder";
  }
  if (preferences.budgetCeiling <= 180) {
    return "value-optimizer";
  }
  return "strategic-explorer";
}

function calculatePreferenceAlignment({
  owned,
  preferences,
}: {
  owned: ProfileIntelligenceInput["owned"];
  preferences: ProfilePreferences;
}) {
  if (!owned.length) return 0;

  const roleMatch =
    owned.filter((item) =>
      item.fragrance.roles.includes(
        preferences.preferredRole,
      ),
    ).length / owned.length;

  const seasonMatch =
    owned.reduce(
      (sum, item) =>
        sum +
        item.fragrance.seasons[
          preferences.preferredSeason
        ],
      0,
    ) /
    owned.length /
    100;

  const longevityMatch =
    owned.filter(
      (item) =>
        item.fragrance.performance.longevity >=
        preferences.minimumLongevity,
    ).length / owned.length;

  return Math.round(
    clamp(
      (roleMatch * 0.38 +
        seasonMatch * 0.34 +
        longevityMatch * 0.28) *
        100,
    ),
  );
}

function buildIdentityStatement({
  archetype,
  tasteGenome,
  wearAnalytics,
  preferences,
}: {
  archetype: CollectorArchetype;
  tasteGenome: TasteGenomeDimension[];
  wearAnalytics: WearAnalytics;
  preferences: ProfilePreferences;
}) {
  const dominant = tasteGenome
    .slice(0, 3)
    .map((item) => capitalize(item.dimension))
    .join(", ");

  return `You are a ${formatArchetype(
    archetype,
  ).toLowerCase()} whose demonstrated taste centers on ${dominant} DNA. Your wear behavior favors ${capitalize(
    wearAnalytics.favoriteRoles[0]?.role ??
      preferences.preferredRole,
  )} use, with ${capitalize(
    wearAnalytics.preferredSeason,
  )} emerging as the strongest real-world season.`;
}

function formatArchetype(value: CollectorArchetype) {
  return {
    "strategic-explorer": "Strategic Explorer",
    "signature-loyalist": "Signature Loyalist",
    "performance-curator": "Performance Curator",
    "versatility-builder": "Versatility Builder",
    "artistic-discoverer": "Artistic Discoverer",
    "value-optimizer": "Value Optimizer",
  }[value];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value));
}
