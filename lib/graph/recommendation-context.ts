import type {
  GlobalIntelligenceService,
} from "@/lib/graph/global-intelligence-service";

export function buildGraphRecommendationContext({
  service,
  fragranceId,
}: {
  service:
    GlobalIntelligenceService;
  fragranceId: string;
}) {
  const entity =
    service
      .searchEntities(
        fragranceId,
      )
      .find(
        (item) =>
          item.type ===
          "fragrance",
      );

  if (!entity) {
    return {
      fragranceId,
      similarCount: 0,
      competitorCount: 0,
      sharedDnaCount: 0,
      curatedRelationshipCount: 0,
      strongestRelationships: [],
    };
  }

  const neighbors =
    service.getNeighbors(
      entity.canonicalId,
    );

  return {
    fragranceId,
    similarCount:
      neighbors.filter(
        (item) =>
          item.relationship
            .type ===
          "similar-to",
      ).length,
    competitorCount:
      neighbors.filter(
        (item) =>
          item.relationship
            .type ===
          "competes-with",
      ).length,
    sharedDnaCount:
      neighbors.filter(
        (item) =>
          item.relationship
            .type ===
          "shares-dna",
      ).length,
    curatedRelationshipCount:
      neighbors.filter(
        (item) =>
          item.relationship
            .source ===
          "curated",
      ).length,
    strongestRelationships:
      neighbors
        .slice()
        .sort(
          (a, b) =>
            b.relationship
              .weight -
            a.relationship
              .weight,
        )
        .slice(
          0,
          8,
        )
        .map(
          (item) => ({
            target:
              item.entity.name,
            type:
              item.relationship
                .type,
            weight:
              item.relationship
                .weight,
            confidence:
              item.relationship
                .confidence,
          }),
        ),
  };
}
