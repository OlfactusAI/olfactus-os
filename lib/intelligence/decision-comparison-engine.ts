import type { CollectionHealthAnalysis } from "@/lib/domain/analysis";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import {
  analyzeDecisionLab,
  type DecisionLabOutput,
} from "@/lib/intelligence/decision-lab-engine";

export type ComparisonCategory =
  | "purchase-score"
  | "collection-fit"
  | "dna-expansion"
  | "role-value"
  | "season-value"
  | "performance"
  | "value"
  | "long-term"
  | "overlap-risk"
  | "regret-risk";

export interface ComparisonCategoryResult {
  id: ComparisonCategory;
  label: string;
  firstValue: number;
  secondValue: number;
  winnerId: string | null;
  advantage: number;
  inverse: boolean;
}

export interface DecisionComparisonOutput {
  modelVersion: "DC-1.0.0";
  generatedAt: string;
  first: DecisionLabOutput;
  second: DecisionLabOutput;
  winner: DecisionLabOutput;
  runnerUp: DecisionLabOutput;
  margin: number;
  confidence: number;
  categoryWins: {
    first: number;
    second: number;
    ties: number;
  };
  categories: ComparisonCategoryResult[];
  winnerReasons: string[];
  runnerUpAdvantages: string[];
  analystVerdict: string;
}

export interface DecisionComparisonInput {
  firstCandidate: FragranceRecord;
  secondCandidate: FragranceRecord;
  owned: FragranceRecord[];
  analysis: CollectionHealthAnalysis;
  firstPrice?: number;
  secondPrice?: number;
}

export function compareDecisionCandidates({
  firstCandidate,
  secondCandidate,
  owned,
  analysis,
  firstPrice,
  secondPrice,
}: DecisionComparisonInput): DecisionComparisonOutput {
  if (firstCandidate.id === secondCandidate.id) {
    throw new Error("Decision Comparison requires two different candidates.");
  }

  const first = analyzeDecisionLab({
    candidate: firstCandidate,
    owned,
    analysis,
    price: firstPrice,
  });

  const second = analyzeDecisionLab({
    candidate: secondCandidate,
    owned,
    analysis,
    price: secondPrice,
  });

  const categories: ComparisonCategoryResult[] = [
    category(
      "purchase-score",
      "Purchase Score",
      first.score,
      second.score,
      firstCandidate.id,
      secondCandidate.id,
    ),
    category(
      "collection-fit",
      "Collection Fit",
      first.metrics.collectionFit,
      second.metrics.collectionFit,
      firstCandidate.id,
      secondCandidate.id,
    ),
    category(
      "dna-expansion",
      "DNA Expansion",
      first.metrics.dnaExpansion,
      second.metrics.dnaExpansion,
      firstCandidate.id,
      secondCandidate.id,
    ),
    category(
      "role-value",
      "Role Value",
      first.metrics.roleValue,
      second.metrics.roleValue,
      firstCandidate.id,
      secondCandidate.id,
    ),
    category(
      "season-value",
      "Season Value",
      first.metrics.seasonValue,
      second.metrics.seasonValue,
      firstCandidate.id,
      secondCandidate.id,
    ),
    category(
      "performance",
      "Performance",
      first.metrics.performance,
      second.metrics.performance,
      firstCandidate.id,
      secondCandidate.id,
    ),
    category(
      "value",
      "Value Efficiency",
      first.metrics.value,
      second.metrics.value,
      firstCandidate.id,
      secondCandidate.id,
    ),
    category(
      "long-term",
      "Long-Term Ownership",
      first.metrics.longTermOwnership,
      second.metrics.longTermOwnership,
      firstCandidate.id,
      secondCandidate.id,
    ),
    category(
      "overlap-risk",
      "Overlap Risk",
      first.metrics.overlapRisk,
      second.metrics.overlapRisk,
      firstCandidate.id,
      secondCandidate.id,
      true,
    ),
    category(
      "regret-risk",
      "Regret Risk",
      first.metrics.regretRisk,
      second.metrics.regretRisk,
      firstCandidate.id,
      secondCandidate.id,
      true,
    ),
  ];

  const firstCategoryWins = categories.filter(
    (result) => result.winnerId === firstCandidate.id,
  ).length;
  const secondCategoryWins = categories.filter(
    (result) => result.winnerId === secondCandidate.id,
  ).length;
  const ties = categories.filter((result) => result.winnerId === null).length;

  const firstComposite = comparisonComposite(first, firstCategoryWins);
  const secondComposite = comparisonComposite(second, secondCategoryWins);

  const winner =
    firstComposite >= secondComposite ? first : second;
  const runnerUp = winner === first ? second : first;
  const margin = Math.round(
    Math.abs(firstComposite - secondComposite),
  );

  const winnerReasons = categories
    .filter((result) => result.winnerId === winner.candidate.id)
    .sort((a, b) => b.advantage - a.advantage)
    .slice(0, 4)
    .map(
      (result) =>
        `${result.label}: ${formatAdvantage(
          result.advantage,
          result.inverse,
        )}`,
    );

  const runnerUpAdvantages = categories
    .filter((result) => result.winnerId === runnerUp.candidate.id)
    .sort((a, b) => b.advantage - a.advantage)
    .slice(0, 3)
    .map(
      (result) =>
        `${result.label}: ${formatAdvantage(
          result.advantage,
          result.inverse,
        )}`,
    );

  const confidence = Math.round(
    clamp(
      winner.confidence * 0.5 +
        (100 - runnerUp.metrics.regretRisk) * 0.17 +
        Math.min(100, 55 + margin * 3) * 0.33,
    ),
  );

  return {
    modelVersion: "DC-1.0.0",
    generatedAt: new Date().toISOString(),
    first,
    second,
    winner,
    runnerUp,
    margin,
    confidence,
    categoryWins: {
      first: firstCategoryWins,
      second: secondCategoryWins,
      ties,
    },
    categories,
    winnerReasons,
    runnerUpAdvantages,
    analystVerdict: createAnalystVerdict({
      winner,
      runnerUp,
      margin,
      winnerReasons,
      runnerUpAdvantages,
    }),
  };
}

function category(
  id: ComparisonCategory,
  label: string,
  firstValue: number,
  secondValue: number,
  firstId: string,
  secondId: string,
  inverse = false,
): ComparisonCategoryResult {
  const firstAdjusted = inverse ? 100 - firstValue : firstValue;
  const secondAdjusted = inverse ? 100 - secondValue : secondValue;
  const difference = Math.abs(firstAdjusted - secondAdjusted);
  const winnerId =
    difference < 3
      ? null
      : firstAdjusted > secondAdjusted
        ? firstId
        : secondId;

  return {
    id,
    label,
    firstValue,
    secondValue,
    winnerId,
    advantage: Math.round(difference),
    inverse,
  };
}

function comparisonComposite(
  decision: DecisionLabOutput,
  categoryWins: number,
) {
  return (
    decision.score * 0.42 +
    decision.confidence * 0.18 +
    decision.metrics.longTermOwnership * 0.15 +
    decision.metrics.value * 0.08 +
    (100 - decision.metrics.regretRisk) * 0.1 +
    categoryWins * 1.4
  );
}

function createAnalystVerdict({
  winner,
  runnerUp,
  margin,
  winnerReasons,
  runnerUpAdvantages,
}: {
  winner: DecisionLabOutput;
  runnerUp: DecisionLabOutput;
  margin: number;
  winnerReasons: string[];
  runnerUpAdvantages: string[];
}) {
  const marginLanguage =
    margin >= 15
      ? "decisive"
      : margin >= 8
        ? "clear"
        : margin >= 4
          ? "narrow"
          : "very close";

  const runnerUpSentence = runnerUpAdvantages.length
    ? `${runnerUp.candidate.name} still leads in ${runnerUpAdvantages
        .map((reason) => reason.split(":")[0].toLowerCase())
        .join(" and ")}.`
    : `${runnerUp.candidate.name} does not establish a decisive category advantage.`;

  return `${winner.candidate.name} is the ${marginLanguage} winner for this collection. Its strongest advantages are ${winnerReasons
    .map((reason) => reason.split(":")[0].toLowerCase())
    .join(", ")}. The purchase score is ${winner.score}/100 versus ${runnerUp.score}/100, while regret risk is ${winner.metrics.regretRisk}% versus ${runnerUp.metrics.regretRisk}%. ${runnerUpSentence}`;
}

function formatAdvantage(value: number, inverse: boolean) {
  return inverse
    ? `${value} points lower risk`
    : `${value} points stronger`;
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value));
}
