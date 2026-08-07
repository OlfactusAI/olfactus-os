import type {
  CatalogIntelligenceDraft,
  IntelligenceDraftStatus,
} from "@/lib/catalog-v2/enrichment/intelligence-types";
import {
  evaluateIntelligencePromotion,
} from "@/lib/catalog-v2/enrichment/promotion-gate";

export function createCatalogIntelligenceDraftStore(
  initial:
    CatalogIntelligenceDraft[] =
      [],
) {
  let drafts = [
    ...initial,
  ];

  return {
    list() {
      return [
        ...drafts,
      ];
    },

    get(
      canonicalId: string,
    ) {
      return drafts.find(
        (draft) =>
          draft.canonicalId ===
          canonicalId,
      );
    },

    upsert(
      draft:
        CatalogIntelligenceDraft,
    ) {
      const index =
        drafts.findIndex(
          (current) =>
            current.canonicalId ===
            draft.canonicalId,
        );

      if (
        index ===
        -1
      ) {
        drafts.push(
          draft,
        );
      } else {
        drafts[
          index
        ] =
          draft;
      }

      return draft;
    },

    setStatus(
      canonicalId: string,
      status:
        IntelligenceDraftStatus,
      timestamp =
        new Date()
          .toISOString(),
    ) {
      drafts =
        drafts.map(
          (draft) =>
            draft.canonicalId ===
            canonicalId
              ? {
                  ...draft,
                  status,
                  updatedAt:
                    timestamp,
                }
              : draft,
        );

      return this.get(
        canonicalId,
      );
    },

    reviewQueue() {
      return drafts
        .map(
          (draft) => ({
            draft,
            decision:
              evaluateIntelligencePromotion(
                draft,
              ),
          }),
        )
        .sort(
          (
            a,
            b,
          ) =>
            Number(
              a.decision
                .eligible,
            ) -
              Number(
                b.decision
                  .eligible,
              ) ||
            a.decision
              .confidence -
              b.decision
                .confidence ||
            a.draft.brand.localeCompare(
              b.draft.brand,
            ),
        );
    },
  };
}

export type CatalogIntelligenceDraftStore =
  ReturnType<
    typeof createCatalogIntelligenceDraftStore
  >;
