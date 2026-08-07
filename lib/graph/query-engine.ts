import type {
  GlobalEntityType,
  GlobalGraphNeighbor,
  GlobalIntelligenceGraph,
  GlobalRelationshipType,
} from "@/lib/graph/global-types";

export function findGlobalNeighbors({
  graph,
  entityId,
  relationshipTypes,
  entityTypes,
  limit = 50,
}: {
  graph: GlobalIntelligenceGraph;
  entityId: string;
  relationshipTypes?: GlobalRelationshipType[];
  entityTypes?: GlobalEntityType[];
  limit?: number;
}): GlobalGraphNeighbor[] {
  const entityById = new Map(graph.entities.map((entity) => [entity.canonicalId, entity]));
  const output: GlobalGraphNeighbor[] = [];

  for (const relationship of graph.relationships) {
    if (relationshipTypes && !relationshipTypes.includes(relationship.type)) continue;

    let targetId: string | undefined;
    let direction: GlobalGraphNeighbor["direction"] | undefined;

    if (relationship.sourceId === entityId) {
      targetId = relationship.targetId;
      direction = "outgoing";
    } else if (relationship.targetId === entityId) {
      targetId = relationship.sourceId;
      direction = "incoming";
    }

    if (!targetId || !direction) continue;
    const entity = entityById.get(targetId);
    if (!entity) continue;
    if (entityTypes && !entityTypes.includes(entity.type)) continue;

    output.push({ entity, relationship, direction });
  }

  return output.sort((a, b) => b.relationship.weight - a.relationship.weight).slice(0, limit);
}

export function findBrandPortfolio(graph: GlobalIntelligenceGraph, brandEntityId: string) {
  return findGlobalNeighbors({
    graph,
    entityId: brandEntityId,
    relationshipTypes: ["belongs-to-brand"],
    entityTypes: ["fragrance"],
    limit: 500,
  });
}

export function findPerfumerPortfolio(graph: GlobalIntelligenceGraph, perfumerEntityId: string) {
  return findGlobalNeighbors({
    graph,
    entityId: perfumerEntityId,
    relationshipTypes: ["created-by"],
    entityTypes: ["fragrance"],
    limit: 500,
  });
}

export function findSimilarFragrances(
  graph: GlobalIntelligenceGraph,
  fragranceEntityId: string,
  minimumWeight = 70,
  limit = 20,
) {
  return findGlobalNeighbors({
    graph,
    entityId: fragranceEntityId,
    relationshipTypes: ["similar-to", "competes-with", "shares-dna"],
    entityTypes: ["fragrance"],
    limit: limit * 2,
  })
    .filter((item) => item.relationship.weight >= minimumWeight)
    .slice(0, limit);
}

export function findSharedEntities(
  graph: GlobalIntelligenceGraph,
  leftId: string,
  rightId: string,
  relationshipType: GlobalRelationshipType,
  entityType: GlobalEntityType,
) {
  const left = findGlobalNeighbors({
    graph,
    entityId: leftId,
    relationshipTypes: [relationshipType],
    entityTypes: [entityType],
    limit: 500,
  });
  const rightIds = new Set(
    findGlobalNeighbors({
      graph,
      entityId: rightId,
      relationshipTypes: [relationshipType],
      entityTypes: [entityType],
      limit: 500,
    }).map((item) => item.entity.canonicalId),
  );

  return left.filter((item) => rightIds.has(item.entity.canonicalId)).map((item) => item.entity);
}
