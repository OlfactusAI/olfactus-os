import type {
  OpportunityCostResult,
  RecommendationCandidateV2,
} from "@/lib/recommendation-v2/types";

export function calculateOpportunityCost({
  candidate,
  alternatives,
}: {
  candidate:
    RecommendationCandidateV2;
  alternatives:
    RecommendationCandidateV2[];
}): OpportunityCostResult {
  const next =
    alternatives
      .filter(
        (item) =>
          item.fragrance
            .id !==
          candidate.fragrance
            .id,
      )
      .sort(
        (a, b) =>
          b.score -
          a.score,
      )[0];

  if (!next) {
    return {
      candidateId:
        candidate.fragrance
          .id,
      expectedGain:
        candidate.score,
      expectedLoss: 0,
      netGain:
        candidate.score,
      explanation:
        "No competing candidate was available for opportunity-cost comparison.",
    };
  }

  const expectedGain =
    candidate.score;
  const expectedLoss =
    Math.max(
      0,
      next.score -
        55,
    );
  const netGain =
    expectedGain -
    expectedLoss;

  return {
    candidateId:
      candidate.fragrance
        .id,
    delayedCandidateId:
      next.fragrance.id,
    expectedGain,
    expectedLoss,
    netGain,
    explanation:
      `Choosing ${candidate.fragrance.name} delays ${next.fragrance.name}, producing an estimated net decision gain of ${Math.round(netGain)} points.`,
  };
}
