import type {
  OlfactusIntelligenceApi,
} from "@/lib/intelligence-api";
import {
  buildCollectorPreferenceEmbedding,
} from "@/lib/embedding/collector-preference";
import {
  interpretFragranceRequest,
} from "@/lib/language/interpreter";
import {
  findSemanticCandidates,
} from "@/lib/semantic/search";
import {
  evaluateCandidateDecision,
} from "@/lib/decision-core/engine";

export function runSemanticFragranceQuery({
  api,
  text,
  limit = 8,
}: {
  api:
    OlfactusIntelligenceApi;
  text: string;
  limit?: number;
}) {
  const state =
    api.getCollectorState();
  const catalog =
    api.getCatalogContext();
  const collectorEmbedding =
    buildCollectorPreferenceEmbedding({
      state,
      catalog,
    });
  const request =
    interpretFragranceRequest({
      text,
      catalog,
      collectorEmbedding,
    });
  const ownedIds =
    new Set(
      state.ownership.map(
        (item) =>
          item.fragranceId,
      ),
    );
  const candidates =
    findSemanticCandidates({
      request,
      collectorEmbedding,
      catalog,
      ownedIds,
      limit,
    });

  const decisions =
    candidates.map(
      (candidate) => {
        let decision:
          ReturnType<
            typeof evaluateCandidateDecision
          > |
          undefined;

        try {
          decision =
            evaluateCandidateDecision({
              api,
              candidateFragranceId:
                candidate
                  .fragrance.id,
            });
        } catch {
          decision =
            undefined;
        }

        return {
          ...candidate,
          decision,
          combinedScore:
            Math.round(
              candidate.semanticScore *
                0.62 +
                (
                  decision?.score ??
                  55
                ) *
                  0.38,
            ),
        };
      },
    )
    .sort(
      (a, b) =>
        b.combinedScore -
        a.combinedScore,
    );

  return {
    modelVersion:
      "PFL-1.0.0/PEM-1.0.0",
    collectorEmbedding,
    request,
    candidates:
      decisions,
  };
}
