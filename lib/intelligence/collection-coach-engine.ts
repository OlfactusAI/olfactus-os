import type { CollectionHealthAnalysis } from "@/lib/domain/analysis";
import type {
  DnaDimension,
  FragranceRecord,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";
import {
  generateDiscoveryIntelligence,
  type DiscoveryRecommendation,
} from "@/lib/intelligence/discovery-engine";

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

export type CoachGoal =
  | "health"
  | "rotation"
  | "diversity"
  | "seasonal-balance"
  | "signature"
  | "buy-less";

export type CoachActionType =
  | "wear"
  | "revisit"
  | "explore"
  | "avoid"
  | "review";

export interface CoachMemory {
  completedActionIds: string[];
  dismissedActionIds: string[];
  recentRecommendationIds: string[];
  activeGoal: CoachGoal;
  lastBriefingDate: string | null;
}

export interface CoachAction {
  id: string;
  type: CoachActionType;
  priority: number;
  title: string;
  subject: string;
  explanation: string;
  confidence: number;
  fragranceId?: string;
  projectedImpact?: number;
}

export interface CoachOpportunity {
  id: string;
  label: string;
  category: string;
  score: number;
  projectedImpact: number;
  explanation: string;
  candidateId?: string;
}

export interface CoachTimelineDay {
  dayIndex: number;
  label: string;
  actionId: string;
  actionType: CoachActionType;
  title: string;
  subject: string;
  completed: boolean;
}

export interface CoachGoalProgress {
  goal: CoachGoal;
  label: string;
  current: number;
  target: number;
  progress: number;
  remaining: number;
  explanation: string;
}

export interface CollectionCoachOutput {
  modelVersion: "CC-1.0.0";
  generatedAt: string;
  coachConfidence: number;
  briefing: string;
  focusTitle: string;
  focusExplanation: string;
  priorities: CoachAction[];
  opportunities: CoachOpportunity[];
  timeline: CoachTimelineDay[];
  goal: CoachGoalProgress;
  strongestDna: DnaDimension[];
  weakestSeason: Season;
  purchasePauseRecommended: boolean;
  discoveryCandidate: DiscoveryRecommendation | null;
}

export interface CollectionCoachInput {
  owned: Array<{
    fragrance: FragranceRecord;
    wearCount: number;
    daysSinceLastWear: number;
    favorite: boolean;
  }>;
  available: FragranceRecord[];
  analysis: CollectionHealthAnalysis;
  memory: CoachMemory;
  now?: Date;
}

export const defaultCoachMemory: CoachMemory = {
  completedActionIds: [],
  dismissedActionIds: [],
  recentRecommendationIds: [],
  activeGoal: "health",
  lastBriefingDate: null,
};

export function runCollectionCoach({
  owned,
  available,
  analysis,
  memory,
  now = new Date(),
}: CollectionCoachInput): CollectionCoachOutput {
  const ownedFragrances = owned.map(({ fragrance }) => fragrance);

  const discovery = generateDiscoveryIntelligence({
    owned: ownedFragrances,
    candidates: available,
    analysis,
  });

  const strongestDna = getStrongestDna(ownedFragrances);
  const weakestSeason = getWeakestSeason(ownedFragrances);
  const neglected = [...owned]
    .filter((entry) => entry.daysSinceLastWear >= 21)
    .sort((a, b) => b.daysSinceLastWear - a.daysSinceLastWear);

  const overused = [...owned]
    .filter((entry) => entry.wearCount >= 8)
    .sort((a, b) => b.wearCount - a.wearCount);

  const purchasePauseRecommended =
    analysis.dimensions.rotation < 72 ||
    analysis.dimensions.redundancy < 68 ||
    owned.length >= 12;

  const actions = buildActions({
    owned,
    neglected,
    overused,
    discoveryPrimary: discovery.primary,
    analysis,
    strongestDna,
    weakestSeason,
    purchasePauseRecommended,
    memory,
  });

  const priorities = actions
    .filter(
      (action) =>
        !memory.dismissedActionIds.includes(action.id),
    )
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);

  const opportunities = buildOpportunities({
    analysis,
    discoveryPrimary: discovery.primary,
    strongestDna,
    weakestSeason,
  });

  const goal = buildGoalProgress({
    goal: memory.activeGoal,
    analysis,
    owned,
  });

  const focus = priorities[0];

  return {
    modelVersion: "CC-1.0.0",
    generatedAt: now.toISOString(),
    coachConfidence: Math.round(
      clamp(
        analysis.confidence * 0.42 +
          discovery.confidence * 0.35 +
          Math.min(100, owned.length * 8) * 0.23,
      ),
    ),
    briefing: buildBriefing({
      analysis,
      priorities,
      strongestDna,
      weakestSeason,
      purchasePauseRecommended,
      discoveryPrimary: discovery.primary,
    }),
    focusTitle: focus?.title ?? "Continue collection calibration",
    focusExplanation:
      focus?.explanation ??
      "Log more wears to improve coaching precision.",
    priorities,
    opportunities,
    timeline: buildTimeline({
      priorities,
      completedActionIds: memory.completedActionIds,
      now,
    }),
    goal,
    strongestDna,
    weakestSeason,
    purchasePauseRecommended,
    discoveryCandidate: discovery.primary,
  };
}

function buildActions({
  owned,
  neglected,
  overused,
  discoveryPrimary,
  analysis,
  strongestDna,
  weakestSeason,
  purchasePauseRecommended,
  memory,
}: {
  owned: CollectionCoachInput["owned"];
  neglected: CollectionCoachInput["owned"];
  overused: CollectionCoachInput["owned"];
  discoveryPrimary: DiscoveryRecommendation | null;
  analysis: CollectionHealthAnalysis;
  strongestDna: DnaDimension[];
  weakestSeason: Season;
  purchasePauseRecommended: boolean;
  memory: CoachMemory;
}) {
  const actions: CoachAction[] = [];

  const wearCandidate = [...owned]
    .filter(
      (entry) =>
        !memory.recentRecommendationIds.includes(
          entry.fragrance.id,
        ),
    )
    .sort((a, b) => {
      const aScore =
        a.daysSinceLastWear * 0.7 +
        a.fragrance.seasons[weakestSeason] * 0.3;
      const bScore =
        b.daysSinceLastWear * 0.7 +
        b.fragrance.seasons[weakestSeason] * 0.3;
      return bScore - aScore;
    })[0] ?? owned[0];

  if (wearCandidate) {
    actions.push({
      id: `wear-${wearCandidate.fragrance.id}`,
      type: "wear",
      priority: 96,
      title: "Wear next",
      subject: wearCandidate.fragrance.name,
      explanation: `It has been ${wearCandidate.daysSinceLastWear} days since its last wear and it supports ${capitalize(
        weakestSeason,
      )} coverage.`,
      confidence: 94,
      fragranceId: wearCandidate.fragrance.id,
    });
  }

  if (neglected[0]) {
    actions.push({
      id: `revisit-${neglected[0].fragrance.id}`,
      type: "revisit",
      priority: 91,
      title: "Revisit",
      subject: neglected[0].fragrance.name,
      explanation: `This bottle has been idle for ${neglected[0].daysSinceLastWear} days and is reducing rotation balance.`,
      confidence: 92,
      fragranceId: neglected[0].fragrance.id,
      projectedImpact: 3,
    });
  }

  if (purchasePauseRecommended) {
    actions.push({
      id: "avoid-purchase-overlap",
      type: "avoid",
      priority: 88,
      title: "Avoid buying",
      subject: `${capitalize(strongestDna[0] ?? "woody")} dominant fragrances`,
      explanation:
        "Your current collection needs more wear data and rotation balance before another similar purchase.",
      confidence: 90,
    });
  } else if (discoveryPrimary) {
    actions.push({
      id: `explore-${discoveryPrimary.fragrance.id}`,
      type: "explore",
      priority: 87,
      title: "Explore strategically",
      subject: discoveryPrimary.fragrance.name,
      explanation: discoveryPrimary.summary,
      confidence: discoveryPrimary.confidence,
      fragranceId: discoveryPrimary.fragrance.id,
      projectedImpact: discoveryPrimary.projectedHealthGain,
    });
  }

  if (overused[0]) {
    actions.push({
      id: `review-overuse-${overused[0].fragrance.id}`,
      type: "review",
      priority: 77,
      title: "Reduce repetition",
      subject: overused[0].fragrance.name,
      explanation: `${overused[0].wearCount} wears makes it the most repeated bottle in the current rotation.`,
      confidence: 84,
      fragranceId: overused[0].fragrance.id,
    });
  }

  if (analysis.findings[0]) {
    actions.push({
      id: `review-${analysis.findings[0].type}`,
      type: "review",
      priority: 82,
      title: "Collection review",
      subject: analysis.findings[0].title,
      explanation: analysis.findings[0].explanation,
      confidence: Math.round(
        analysis.findings[0].confidence * 100,
      ),
      projectedImpact:
        analysis.recommendations[0]?.projectedImpact,
    });
  }

  return actions;
}

function buildOpportunities({
  analysis,
  discoveryPrimary,
  strongestDna,
  weakestSeason,
}: {
  analysis: CollectionHealthAnalysis;
  discoveryPrimary: DiscoveryRecommendation | null;
  strongestDna: DnaDimension[];
  weakestSeason: Season;
}) {
  const rows: CoachOpportunity[] = [];

  if (discoveryPrimary) {
    rows.push({
      id: `candidate-${discoveryPrimary.fragrance.id}`,
      label: discoveryPrimary.fragrance.name,
      category: discoveryPrimary.fragrance.family,
      score: discoveryPrimary.score,
      projectedImpact:
        discoveryPrimary.projectedHealthGain,
      explanation: discoveryPrimary.summary,
      candidateId: discoveryPrimary.fragrance.id,
    });
  }

  rows.push({
    id: `season-${weakestSeason}`,
    label: `${capitalize(weakestSeason)} coverage`,
    category: "Seasonal balance",
    score: analysis.dimensions.seasonalBalance,
    projectedImpact: Math.max(
      1,
      Math.round(
        (100 - analysis.dimensions.seasonalBalance) / 12,
      ),
    ),
    explanation: `${capitalize(
      weakestSeason,
    )} is the weakest season in the current collection.`,
  });

  rows.push({
    id: "diversity-growth",
    label: "DNA diversity",
    category: "Collection identity",
    score: analysis.dimensions.diversity,
    projectedImpact: Math.max(
      1,
      Math.round(
        (100 - analysis.dimensions.diversity) / 14,
      ),
    ),
    explanation: `The collection is strongest in ${strongestDna
      .slice(0, 2)
      .map(capitalize)
      .join(" and ")} DNA.`,
  });

  rows.push({
    id: "rotation-growth",
    label: "Rotation quality",
    category: "Wear behavior",
    score: analysis.dimensions.rotation,
    projectedImpact: Math.max(
      1,
      Math.round(
        (100 - analysis.dimensions.rotation) / 15,
      ),
    ),
    explanation:
      "More balanced wear distribution will improve collection efficiency.",
  });

  return rows
    .sort(
      (a, b) =>
        b.projectedImpact - a.projectedImpact,
    )
    .slice(0, 4);
}

function buildGoalProgress({
  goal,
  analysis,
  owned,
}: {
  goal: CoachGoal;
  analysis: CollectionHealthAnalysis;
  owned: CollectionCoachInput["owned"];
}) {
  const configurations: Record<
    CoachGoal,
    {
      label: string;
      current: number;
      target: number;
      explanation: string;
    }
  > = {
    health: {
      label: "Reach Collection Health 95",
      current: analysis.score,
      target: 95,
      explanation:
        "Improve the weakest collection dimensions without increasing redundancy.",
    },
    rotation: {
      label: "Reach Rotation Health 90",
      current: analysis.dimensions.rotation,
      target: 90,
      explanation:
        "Distribute wears more evenly across owned fragrances.",
    },
    diversity: {
      label: "Reach DNA Diversity 90",
      current: analysis.dimensions.diversity,
      target: 90,
      explanation:
        "Expand the collection beyond its dominant scent directions.",
    },
    "seasonal-balance": {
      label: "Reach Seasonal Balance 92",
      current: analysis.dimensions.seasonalBalance,
      target: 92,
      explanation:
        "Strengthen the weakest season without duplicating existing DNA.",
    },
    signature: {
      label: "Strengthen Signature Identity",
      current: analysis.dimensions.identity,
      target: 92,
      explanation:
        "Refine the collection around a clear and recognizable scent identity.",
    },
    "buy-less": {
      label: "Buy Less, Wear More",
      current: Math.round(
        clamp(
          analysis.dimensions.rotation * 0.7 +
            Math.min(
              100,
              owned.reduce(
                (sum, entry) => sum + entry.wearCount,
                0,
              ) * 2,
            ) *
              0.3,
        ),
      ),
      target: 90,
      explanation:
        "Increase usage and purchase discipline before adding more bottles.",
    },
  };

  const config = configurations[goal];

  return {
    goal,
    label: config.label,
    current: config.current,
    target: config.target,
    progress: Math.round(
      clamp((config.current / config.target) * 100),
    ),
    remaining: Math.max(
      0,
      config.target - config.current,
    ),
    explanation: config.explanation,
  };
}

function buildTimeline({
  priorities,
  completedActionIds,
  now,
}: {
  priorities: CoachAction[];
  completedActionIds: string[];
  now: Date;
}) {
  const fallbackAction: CoachAction = {
    id: "weekly-review",
    type: "review",
    priority: 50,
    title: "Review collection",
    subject: "Collection health check",
    explanation:
      "Reassess progress and update the next coaching plan.",
    confidence: 80,
  };

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + index);
    const action =
      priorities[index % Math.max(1, priorities.length)] ??
      fallbackAction;

    return {
      dayIndex: index,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      actionId: action.id,
      actionType: action.type,
      title: action.title,
      subject: action.subject,
      completed: completedActionIds.includes(action.id),
    };
  });
}

function buildBriefing({
  analysis,
  priorities,
  strongestDna,
  weakestSeason,
  purchasePauseRecommended,
  discoveryPrimary,
}: {
  analysis: CollectionHealthAnalysis;
  priorities: CoachAction[];
  strongestDna: DnaDimension[];
  weakestSeason: Season;
  purchasePauseRecommended: boolean;
  discoveryPrimary: DiscoveryRecommendation | null;
}) {
  const purchaseSentence = purchasePauseRecommended
    ? "No full-bottle purchase is recommended today."
    : discoveryPrimary
      ? `${discoveryPrimary.fragrance.name} is the highest-value exploration candidate.`
      : "No new purchase candidate is currently required.";

  const prioritySentence = priorities[0]
    ? `Your highest-priority action is to ${priorities[0].title.toLowerCase()}: ${priorities[0].subject}.`
    : "Continue logging wears to improve coaching precision.";

  return `Your collection is operating at ${analysis.score}/100 with ${analysis.status.toLowerCase()} health. Its strongest identity currently centers on ${strongestDna
    .slice(0, 2)
    .map(capitalize)
    .join(" and ")} DNA, while ${capitalize(
    weakestSeason,
  )} remains the largest seasonal opportunity. ${prioritySentence} ${purchaseSentence}`;
}

function getStrongestDna(
  owned: FragranceRecord[],
): DnaDimension[] {
  if (!owned.length) return ["fresh", "woody"];

  return dnaDimensions
    .map((dimension) => ({
      dimension,
      value:
        owned.reduce(
          (sum, fragrance) =>
            sum + fragrance.dna[dimension],
          0,
        ) / owned.length,
    }))
    .sort((a, b) => b.value - a.value)
    .map(({ dimension }) => dimension);
}

function getWeakestSeason(
  owned: FragranceRecord[],
): Season {
  const seasons: Season[] = [
    "spring",
    "summer",
    "fall",
    "winter",
  ];

  if (!owned.length) return "summer";

  return seasons
    .map((season) => ({
      season,
      value: Math.max(
        ...owned.map(
          (fragrance) => fragrance.seasons[season],
        ),
      ),
    }))
    .sort((a, b) => a.value - b.value)[0].season;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.min(maximum, Math.max(minimum, value));
}
