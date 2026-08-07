import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  calculateCollectionImpactPreview,
} from "@/lib/recommendation-v2/collection-impact";
import type {
  RecommendationCandidateV2,
} from "@/lib/recommendation-v2/types";

export interface RecommendationExplanationV2 {
  candidateId: string;
  fragranceName: string;
  brand: string;
  score: number;
  confidence: number;
  trace:
    RecommendationCandidateV2["trace"];
  strengths: string[];
  friction: string[];
  tradeoff:
    RecommendationCandidateV2["tradeoff"];
  opportunityCost:
    RecommendationCandidateV2["opportunityCost"];
  collectionImpact:
    ReturnType<
      typeof calculateCollectionImpactPreview
    >;
}

export function buildRecommendationExplanationV2({
  candidate,
  collection,
  catalog,
}: {
  candidate:
    RecommendationCandidateV2;
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
}): RecommendationExplanationV2 {
  const strengths =
    candidate.trace
      .filter(
        (item) =>
          item.contribution >
          0,
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
        (item) =>
          item.explanation,
      );

  const friction =
    candidate.trace
      .filter(
        (item) =>
          item.contribution <
          0,
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
        (item) =>
          item.explanation,
      );

  return {
    candidateId:
      candidate.fragrance.id,
    fragranceName:
      candidate.fragrance.name,
    brand:
      candidate.fragrance.brand,
    score:
      candidate.score,
    confidence:
      candidate.confidence,
    trace:
      candidate.trace,
    strengths,
    friction,
    tradeoff:
      candidate.tradeoff,
    opportunityCost:
      candidate.opportunityCost,
    collectionImpact:
      calculateCollectionImpactPreview({
        candidate:
          candidate.fragrance,
        collection,
        catalog,
      }),
  };
}
