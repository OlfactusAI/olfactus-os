import type {
  GlobalIntelligenceGraph,
} from "@/lib/graph/global-types";
import {
  getCuratedWorldKnowledge,
} from "@/lib/graph/data/curated-world-knowledge";

export function mergeCuratedWorldKnowledge(
  graph:
    GlobalIntelligenceGraph,
): GlobalIntelligenceGraph {
  const curated =
    getCuratedWorldKnowledge();

  const entityIds =
    new Set(
      graph.entities.map(
        (entity) =>
          entity.canonicalId,
      ),
    );

  const entities = [
    ...graph.entities,
  ];

  for (
    const entity
    of curated.entities
  ) {
    if (
      !entityIds.has(
        entity.canonicalId,
      )
    ) {
      entityIds.add(
        entity.canonicalId,
      );
      entities.push(
        entity,
      );
    }
  }

  const relationshipById =
    new Map(
      graph.relationships.map(
        (relationship) => [
          relationship.id,
          relationship,
        ],
      ),
    );

  for (
    const relationship
    of curated.relationships
  ) {
    if (
      !entityIds.has(
        relationship.sourceId,
      ) ||
      !entityIds.has(
        relationship.targetId,
      )
    ) {
      continue;
    }

    const existing =
      relationshipById.get(
        relationship.id,
      );

    relationshipById.set(
      relationship.id,
      existing
        ? {
            ...existing,
            weight:
              Math.max(
                existing.weight,
                relationship.weight,
              ),
            confidence:
              Math.max(
                existing.confidence,
                relationship.confidence,
              ),
          }
        : relationship,
    );
  }

  return {
    ...graph,
    entities,
    relationships: [
      ...relationshipById.values(),
    ],
  };
}
