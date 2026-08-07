import type {
  RecommendationTraceStep,
  RecommendationTradeoff,
} from "@/lib/recommendation-v2/types";

export function analyzeTradeoffs(
  trace:
    RecommendationTraceStep[],
): RecommendationTradeoff {
  const advantages =
    trace
      .filter(
        (step) =>
          step.contribution >=
          5,
      )
      .sort(
        (a, b) =>
          b.contribution -
          a.contribution,
      )
      .slice(
        0,
        5,
      )
      .map(
        (step) =>
          step.explanation,
      );

  const disadvantages =
    trace
      .filter(
        (step) =>
          step.contribution <=
          -3,
      )
      .sort(
        (a, b) =>
          a.contribution -
          b.contribution,
      )
      .slice(
        0,
        5,
      )
      .map(
        (step) =>
          step.explanation,
      );

  const total =
    trace.reduce(
      (
        sum,
        step,
      ) =>
        sum +
        step.contribution,
      0,
    );

  return {
    advantages,
    disadvantages,
    netAssessment:
      total >=
      30
        ? "strong-buy"
        : total >=
            20
          ? "buy"
          : total >=
              8
            ? "sample"
            : total >=
                0
              ? "wait"
              : "skip",
  };
}
