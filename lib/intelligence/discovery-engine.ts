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

export type DiscoveryRisk = "very-low" | "low" | "moderate" | "high";
export type DiscoveryTier =
  | "highest-impact"
  | "safest-buy"
  | "signature-potential"
  | "most-original"
  | "balanced";

export interface DiscoverySignal {
  id:
    | "collection-fit"
    | "dna-expansion"
    | "role-value"
    | "season-value"
    | "originality"
    | "performance"
    | "data-confidence";
  label: string;
  score: number;
  explanation: string;
}

export interface DiscoveryImpactDimension {
  id: "diversity" | "season" | "roles" | "rotation" | "redundancy";
  label: string;
  current: number;
  projected: number;
  delta: number;
}

export interface NeuralPipelineStage {
  id:
    | "collection-scan"
    | "dna-analysis"
    | "role-detection"
    | "redundancy-check"
    | "health-simulation"
    | "ranking"
    | "decision-verdict";
  label: string;
  status: "complete";
  confidence: number;
}

export interface DiscoveryRecommendation {
  fragrance: FragranceRecord;
  score: number;
  confidence: number;
  projectedHealth: number;
  projectedHealthGain: number;
  analystNarrative: string;
  impactDimensions: DiscoveryImpactDimension[];
  dnaMatch: number;
  originality: number;
  overlapRisk: number;
  blindBuyRisk: DiscoveryRisk;
  tier: DiscoveryTier;
  primaryRole: FragranceRole | null;
  strongestSeason: Season;
  summary: string;
  reasons: string[];
  signals: DiscoverySignal[];
}

export interface DiscoveryEngineOutput {
  generatedAt: string;
  modelVersion: "DE-1.0.0";
  confidence: number;
  primary: DiscoveryRecommendation | null;
  recommendations: DiscoveryRecommendation[];
  opportunityFeed: {
    highestImpact: DiscoveryRecommendation | null;
    safestBuy: DiscoveryRecommendation | null;
    signaturePotential: DiscoveryRecommendation | null;
    mostOriginal: DiscoveryRecommendation | null;
  };
  roadmap: {
    next: DiscoveryRecommendation | null;
    later: DiscoveryRecommendation | null;
    eventually: DiscoveryRecommendation | null;
  };
  pipeline: NeuralPipelineStage[];
}

export interface DiscoveryEngineInput {
  owned: FragranceRecord[];
  candidates: FragranceRecord[];
  analysis: CollectionHealthAnalysis;
  desiredSeason?: Season;
  desiredRole?: FragranceRole;
}

export function generateDiscoveryIntelligence({
  owned,
  candidates,
  analysis,
  desiredSeason,
  desiredRole,
}: DiscoveryEngineInput): DiscoveryEngineOutput {
  const recommendations = candidates
    .map((candidate) =>
      scoreCandidate({
        candidate,
        owned,
        analysis,
        desiredSeason,
        desiredRole,
      }),
    )
    .sort((a, b) => b.score - a.score);

  const highestImpact =
    [...recommendations].sort(
      (a, b) => b.projectedHealthGain - a.projectedHealthGain,
    )[0] ?? null;

  const safestBuy =
    [...recommendations].sort(
      (a, b) =>
        riskWeight(a.blindBuyRisk) - riskWeight(b.blindBuyRisk) ||
        b.confidence - a.confidence,
    )[0] ?? null;

  const signaturePotential =
    [...recommendations].sort((a, b) => {
      const aSignature = a.fragrance.roles.includes("signature") ? 1 : 0;
      const bSignature = b.fragrance.roles.includes("signature") ? 1 : 0;
      return (
        bSignature - aSignature ||
        b.fragrance.performance.longevity -
          a.fragrance.performance.longevity ||
        b.score - a.score
      );
    })[0] ?? null;

  const mostOriginal =
    [...recommendations].sort(
      (a, b) => b.originality - a.originality || b.score - a.score,
    )[0] ?? null;

  return {
    generatedAt: new Date().toISOString(),
    modelVersion: "DE-1.0.0",
    confidence: recommendations.length
      ? Math.round(
          recommendations.reduce(
            (sum, recommendation) => sum + recommendation.confidence,
            0,
          ) / recommendations.length,
        )
      : 0,
    primary: recommendations[0] ?? null,
    recommendations,
    opportunityFeed: {
      highestImpact,
      safestBuy,
      signaturePotential,
      mostOriginal,
    },
    roadmap: {
      next: recommendations[0] ?? null,
      later: recommendations[1] ?? null,
      eventually: recommendations[2] ?? null,
    },
    pipeline: buildPipeline(recommendations),
  };
}

function scoreCandidate({
  candidate,
  owned,
  analysis,
  desiredSeason,
  desiredRole,
}: {
  candidate: FragranceRecord;
  owned: FragranceRecord[];
  analysis: CollectionHealthAnalysis;
  desiredSeason?: Season;
  desiredRole?: FragranceRole;
}): DiscoveryRecommendation {
  const overlapRisk = getMaximumSimilarity(candidate, owned);
  const originality = clamp(100 - overlapRisk);

  const ownedRoles = new Set(owned.flatMap((fragrance) => fragrance.roles));
  const missingRoles = candidate.roles.filter((role) => !ownedRoles.has(role));
  const roleValue = clamp(
    missingRoles.length * 28 +
      candidate.roles.filter((role) => ownedRoles.has(role)).length * 7 +
      (desiredRole && candidate.roles.includes(desiredRole) ? 18 : 0),
  );

  const seasonValue = getSeasonValue(candidate, owned, desiredSeason);
  const dnaExpansion = getDnaExpansion(candidate, owned);
  const collectionFit = getCollectionFit(candidate, owned);
  const performance = clamp(
    candidate.performance.projection * 0.42 +
      candidate.performance.longevity * 0.43 +
      (candidate.performance.drydownQuality ?? 75) * 0.15,
  );
  const dataConfidence = Math.round(
    clamp(
      candidate.intelligence?.confidence ??
        (candidate.intelligenceStatus === "validated"
          ? 94
          : candidate.intelligenceStatus === "calibration"
            ? 82
            : 68),
    ),
  );

  const strategicGapBonus =
    analysis.recommendations.some(
      (recommendation) =>
        recommendation.targetFragranceId === candidate.id,
    )
      ? 14
      : 0;

  const score = Math.round(
    clamp(
      collectionFit * 0.19 +
        dnaExpansion * 0.18 +
        roleValue * 0.18 +
        seasonValue * 0.14 +
        originality * 0.14 +
        performance * 0.1 +
        dataConfidence * 0.07 +
        strategicGapBonus,
    ),
  );

  const projectedHealthGain = Math.max(
    0,
    Math.round(
      (dnaExpansion * 0.26 +
        roleValue * 0.28 +
        seasonValue * 0.2 +
        originality * 0.18) /
        22,
    ),
  );

  const projectedHealth = clamp(
    analysis.score + projectedHealthGain,
    0,
    100,
  );

  const blindBuyRisk = getBlindBuyRisk({
    overlapRisk,
    dataConfidence,
    performance,
    collectionFit,
  });

  const confidence = Math.round(
    clamp(
      dataConfidence * 0.45 +
        collectionFit * 0.22 +
        originality * 0.13 +
        Math.min(100, owned.length * 10) * 0.2,
    ),
  );

  const strongestSeason = seasons.sort(
    (a, b) => candidate.seasons[b] - candidate.seasons[a],
  )[0];

  const primaryRole =
    missingRoles[0] ??
    candidate.roles.find((role) => role === desiredRole) ??
    candidate.roles[0] ??
    null;

  const tier = getTier({
    projectedHealthGain,
    blindBuyRisk,
    originality,
    candidate,
  });

  const reasons = buildReasons({
    candidate,
    missingRoles,
    dnaExpansion,
    originality,
    seasonValue,
    projectedHealthGain,
  });

  const signals: DiscoverySignal[] = [
    {
      id: "collection-fit",
      label: "Collection Fit",
      score: collectionFit,
      explanation:
        collectionFit >= 85
          ? "Strongly aligned with your current taste profile."
          : "Adds value while moving beyond your dominant profile.",
    },
    {
      id: "dna-expansion",
      label: "DNA Expansion",
      score: dnaExpansion,
      explanation:
        dnaExpansion >= 80
          ? "Introduces meaningful new scent-direction coverage."
          : "Builds on DNA you already understand.",
    },
    {
      id: "role-value",
      label: "Role Value",
      score: roleValue,
      explanation: missingRoles.length
        ? `Fills ${missingRoles.map(capitalize).join(", ")} coverage.`
        : "Strengthens existing high-use roles.",
    },
    {
      id: "season-value",
      label: "Season Value",
      score: seasonValue,
      explanation: `Strongest for ${capitalize(strongestSeason)} use.`,
    },
    {
      id: "originality",
      label: "Originality",
      score: originality,
      explanation:
        originality >= 80
          ? "Very low redundancy with your owned fragrances."
          : "Some familiar DNA is present.",
    },
    {
      id: "performance",
      label: "Performance",
      score: Math.round(performance),
      explanation: `${candidate.performance.longevity}/100 longevity with ${candidate.performance.projection}/100 projection.`,
    },
    {
      id: "data-confidence",
      label: "Data Confidence",
      score: dataConfidence,
      explanation: `${candidate.intelligenceStatus} intelligence profile.`,
    },
  ];

  const impactDimensions = buildImpactDimensions({
    analysis,
    dnaExpansion,
    roleValue,
    seasonValue,
    originality,
    projectedHealthGain,
  });

  const analystNarrative = createAnalystNarrative({
    candidate,
    analysis,
    missingRoles,
    dnaExpansion,
    originality,
    overlapRisk,
    strongestSeason,
    projectedHealthGain,
    confidence,
  });

  return {
    fragrance: candidate,
    score,
    confidence,
    projectedHealth,
    projectedHealthGain,
    analystNarrative,
    impactDimensions,
    dnaMatch: collectionFit,
    originality,
    overlapRisk,
    blindBuyRisk,
    tier,
    primaryRole,
    strongestSeason,
    summary: createSummary({
      candidate,
      missingRoles,
      dnaExpansion,
      originality,
      projectedHealthGain,
      strongestSeason,
    }),
    reasons,
    signals,
  };
}

function getCollectionFit(
  candidate: FragranceRecord,
  owned: FragranceRecord[],
) {
  if (!owned.length) return 72;

  const averageDna = Object.fromEntries(
    dnaDimensions.map((dimension) => [
      dimension,
      owned.reduce(
        (sum, fragrance) => sum + fragrance.dna[dimension],
        0,
      ) / owned.length,
    ]),
  ) as Record<DnaDimension, number>;

  const distance =
    dnaDimensions.reduce(
      (sum, dimension) =>
        sum + Math.abs(candidate.dna[dimension] - averageDna[dimension]),
      0,
    ) / dnaDimensions.length;

  return Math.round(clamp(100 - distance * 0.72));
}

function getDnaExpansion(
  candidate: FragranceRecord,
  owned: FragranceRecord[],
) {
  if (!owned.length) return 86;

  const currentMaximums = Object.fromEntries(
    dnaDimensions.map((dimension) => [
      dimension,
      Math.max(...owned.map((fragrance) => fragrance.dna[dimension])),
    ]),
  ) as Record<DnaDimension, number>;

  const expansion =
    dnaDimensions.reduce(
      (sum, dimension) =>
        sum +
        Math.max(
          0,
          candidate.dna[dimension] - currentMaximums[dimension],
        ),
      0,
    ) / dnaDimensions.length;

  const familyBonus = owned.some(
    (fragrance) =>
      fragrance.family.toLowerCase() === candidate.family.toLowerCase(),
  )
    ? 0
    : 28;

  return Math.round(clamp(48 + expansion * 1.2 + familyBonus));
}

function getSeasonValue(
  candidate: FragranceRecord,
  owned: FragranceRecord[],
  desiredSeason?: Season,
) {
  const seasonScores = seasons.map((season) => {
    const currentBest = owned.length
      ? Math.max(...owned.map((fragrance) => fragrance.seasons[season]))
      : 0;
    const gap = Math.max(0, 100 - currentBest);
    const contribution = Math.max(
      0,
      candidate.seasons[season] - currentBest,
    );

    return (
      candidate.seasons[season] * 0.48 +
      gap * 0.24 +
      contribution * 0.28 +
      (desiredSeason === season ? 16 : 0)
    );
  });

  return Math.round(clamp(Math.max(...seasonScores)));
}

function getMaximumSimilarity(
  candidate: FragranceRecord,
  owned: FragranceRecord[],
) {
  if (!owned.length) return 0;

  return Math.max(
    ...owned.map((fragrance) =>
      fragranceSimilarity(candidate, fragrance),
    ),
  );
}

function fragranceSimilarity(
  first: FragranceRecord,
  second: FragranceRecord,
) {
  let dotProduct = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (const dimension of dnaDimensions) {
    dotProduct += first.dna[dimension] * second.dna[dimension];
    firstMagnitude += first.dna[dimension] ** 2;
    secondMagnitude += second.dna[dimension] ** 2;
  }

  const dnaSimilarity =
    dotProduct /
    (Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude) || 1);

  const sharedRoles = first.roles.filter((role) =>
    second.roles.includes(role),
  ).length;
  const unionRoles = new Set([...first.roles, ...second.roles]).size;
  const roleSimilarity = sharedRoles / Math.max(1, unionRoles);

  const sameFamily =
    first.family.toLowerCase() === second.family.toLowerCase() ? 1 : 0;

  return Math.round(
    clamp(
      (dnaSimilarity * 0.62 +
        roleSimilarity * 0.25 +
        sameFamily * 0.13) *
        100,
    ),
  );
}

function getBlindBuyRisk({
  overlapRisk,
  dataConfidence,
  performance,
  collectionFit,
}: {
  overlapRisk: number;
  dataConfidence: number;
  performance: number;
  collectionFit: number;
}): DiscoveryRisk {
  const riskScore =
    overlapRisk * 0.24 +
    (100 - dataConfidence) * 0.34 +
    (100 - performance) * 0.16 +
    (100 - collectionFit) * 0.26;

  if (riskScore <= 18) return "very-low";
  if (riskScore <= 30) return "low";
  if (riskScore <= 44) return "moderate";
  return "high";
}

function getTier({
  projectedHealthGain,
  blindBuyRisk,
  originality,
  candidate,
}: {
  projectedHealthGain: number;
  blindBuyRisk: DiscoveryRisk;
  originality: number;
  candidate: FragranceRecord;
}): DiscoveryTier {
  if (projectedHealthGain >= 5) return "highest-impact";
  if (
    blindBuyRisk === "very-low" ||
    blindBuyRisk === "low"
  ) {
    return "safest-buy";
  }
  if (candidate.roles.includes("signature")) {
    return "signature-potential";
  }
  if (originality >= 85) return "most-original";
  return "balanced";
}

function buildReasons({
  candidate,
  missingRoles,
  dnaExpansion,
  originality,
  seasonValue,
  projectedHealthGain,
}: {
  candidate: FragranceRecord;
  missingRoles: FragranceRole[];
  dnaExpansion: number;
  originality: number;
  seasonValue: number;
  projectedHealthGain: number;
}) {
  const reasons: string[] = [];

  if (missingRoles.length) {
    reasons.push(
      `Fills ${missingRoles.map(capitalize).join(" and ")} role coverage.`,
    );
  }

  if (dnaExpansion >= 75) {
    reasons.push(
      `Expands the collection with ${candidate.family} DNA.`,
    );
  }

  if (originality >= 80) {
    reasons.push("Maintains very low redundancy.");
  }

  if (seasonValue >= 85) {
    reasons.push("Strengthens a meaningful seasonal opportunity.");
  }

  reasons.push(
    `Projects a +${projectedHealthGain} Collection Health gain.`,
  );

  return reasons.slice(0, 4);
}

function createSummary({
  candidate,
  missingRoles,
  dnaExpansion,
  originality,
  projectedHealthGain,
  strongestSeason,
}: {
  candidate: FragranceRecord;
  missingRoles: FragranceRole[];
  dnaExpansion: number;
  originality: number;
  projectedHealthGain: number;
  strongestSeason: Season;
}) {
  const roleSentence = missingRoles.length
    ? `It fills ${missingRoles.map(capitalize).join(" and ")} coverage`
    : "It strengthens roles you already use";

  const dnaSentence =
    dnaExpansion >= 75
      ? `while adding meaningful ${candidate.family} DNA`
      : "while remaining consistent with your established taste";

  const originalitySentence =
    originality >= 80
      ? "with minimal redundancy"
      : "with a controlled level of familiarity";

  return `${roleSentence} ${dnaSentence}, performs best in ${capitalize(
    strongestSeason,
  )}, and is projected to improve Collection Health by ${projectedHealthGain} points ${originalitySentence}.`;
}


function buildImpactDimensions({
  analysis,
  dnaExpansion,
  roleValue,
  seasonValue,
  originality,
  projectedHealthGain,
}: {
  analysis: CollectionHealthAnalysis;
  dnaExpansion: number;
  roleValue: number;
  seasonValue: number;
  originality: number;
  projectedHealthGain: number;
}): DiscoveryImpactDimension[] {
  const diversityGain = Math.max(0, Math.round((dnaExpansion - 50) / 10));
  const seasonGain = Math.max(0, Math.round((seasonValue - 55) / 12));
  const roleGain = Math.max(0, Math.round((roleValue - 45) / 13));
  const rotationGain = Math.max(0, Math.min(5, Math.round(projectedHealthGain * 0.55)));
  const redundancyGain = originality >= 80 ? 0 : -Math.max(0, Math.round((80 - originality) / 12));

  return [
    {
      id: "diversity",
      label: "DNA Diversity",
      current: analysis.dimensions.diversity,
      projected: clamp(analysis.dimensions.diversity + diversityGain),
      delta: diversityGain,
    },
    {
      id: "season",
      label: "Season Coverage",
      current: analysis.dimensions.seasonalBalance,
      projected: clamp(analysis.dimensions.seasonalBalance + seasonGain),
      delta: seasonGain,
    },
    {
      id: "roles",
      label: "Role Coverage",
      current: analysis.dimensions.roleCoverage,
      projected: clamp(analysis.dimensions.roleCoverage + roleGain),
      delta: roleGain,
    },
    {
      id: "rotation",
      label: "Rotation Quality",
      current: analysis.dimensions.rotation,
      projected: clamp(analysis.dimensions.rotation + rotationGain),
      delta: rotationGain,
    },
    {
      id: "redundancy",
      label: "Redundancy Control",
      current: analysis.dimensions.redundancy,
      projected: clamp(analysis.dimensions.redundancy + redundancyGain),
      delta: redundancyGain,
    },
  ];
}

function createAnalystNarrative({
  candidate,
  analysis,
  missingRoles,
  dnaExpansion,
  originality,
  overlapRisk,
  strongestSeason,
  projectedHealthGain,
  confidence,
}: {
  candidate: FragranceRecord;
  analysis: CollectionHealthAnalysis;
  missingRoles: FragranceRole[];
  dnaExpansion: number;
  originality: number;
  overlapRisk: number;
  strongestSeason: Season;
  projectedHealthGain: number;
  confidence: number;
}) {
  const identity =
    analysis.dimensions.diversity >= 85
      ? "already diverse"
      : "concentrated in a narrower scent identity";

  const roleSentence = missingRoles.length
    ? `The candidate directly fills ${missingRoles.map(capitalize).join(" and ")} coverage.`
    : "The candidate strengthens roles that are already central to your collection.";

  const dnaSentence =
    dnaExpansion >= 78
      ? `Its ${candidate.family} profile introduces meaningful new DNA.`
      : `Its profile remains consistent with your established taste.`;

  const riskSentence =
    originality >= 82
      ? `Maximum overlap remains controlled at ${overlapRisk}%, keeping redundancy low.`
      : `Overlap reaches ${overlapRisk}%, so the recommendation prioritizes familiarity over maximum novelty.`;

  return `Your collection is currently ${identity}. ${roleSentence} ${dnaSentence} ${capitalize(
    strongestSeason,
  )} is the strongest seasonal use case. ${riskSentence} The engine projects a ${projectedHealthGain}-point Collection Health improvement with ${confidence}% confidence.`;
}

function buildPipeline(
  recommendations: DiscoveryRecommendation[],
): NeuralPipelineStage[] {
  const baseConfidence = recommendations.length
    ? Math.round(
        recommendations.reduce((sum, item) => sum + item.confidence, 0) /
          recommendations.length,
      )
    : 0;

  return [
    {
      id: "collection-scan",
      label: "Scanning collection",
      status: "complete",
      confidence: Math.min(100, baseConfidence + 4),
    },
    {
      id: "dna-analysis",
      label: "Evaluating DNA",
      status: "complete",
      confidence: baseConfidence,
    },
    {
      id: "role-detection",
      label: "Detecting missing roles",
      status: "complete",
      confidence: Math.max(0, baseConfidence - 2),
    },
    {
      id: "redundancy-check",
      label: "Calculating redundancy",
      status: "complete",
      confidence: Math.max(0, baseConfidence - 1),
    },
    {
      id: "health-simulation",
      label: "Simulating collection health",
      status: "complete",
      confidence: Math.max(0, baseConfidence - 3),
    },
    {
      id: "ranking",
      label: "Ranking recommendations",
      status: "complete",
      confidence: baseConfidence,
    },
  ];
}

function riskWeight(risk: DiscoveryRisk) {
  return {
    "very-low": 0,
    low: 1,
    moderate: 2,
    high: 3,
  }[risk];
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
