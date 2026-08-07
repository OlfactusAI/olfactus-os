import type {
  CatalogV2IntelligenceProfile,
} from "@/lib/catalog-v2/activation/types";
import type {
  CatalogIntelligenceDraft,
} from "@/lib/catalog-v2/enrichment/intelligence-types";
import {
  evaluateIntelligencePromotion,
} from "@/lib/catalog-v2/enrichment/promotion-gate";

export function promoteIntelligenceDraft(
  draft:
    CatalogIntelligenceDraft,
): {
  profile?:
    CatalogV2IntelligenceProfile;
  decision:
    ReturnType<
      typeof evaluateIntelligencePromotion
    >;
} {
  const decision =
    evaluateIntelligencePromotion(
      draft,
    );

  if (
    !decision.eligible
  ) {
    return {
      decision,
    };
  }

  const dna =
    Object.fromEntries(
      Object.entries(
        draft.dna,
      ).map(
        (
          [
            key,
            claim,
          ],
        ) => [
          key,
          claim!.value,
        ],
      ),
    ) as CatalogV2IntelligenceProfile["dna"];

  return {
    profile: {
      roles:
        draft.roles.value,
      seasons:
        draft.seasons.value,
      dna,
      moods:
        draft.moods.value,
      performance: {
        longevity:
          draft.performance
            .longevity.value,
        projection:
          draft.performance
            .projection.value,
        sillage:
          draft.performance
            .sillage.value,
      },
    },
    decision,
  };
}
