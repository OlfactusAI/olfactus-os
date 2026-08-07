import type {
  GlobalGraphPath,
  GlobalIntelligenceGraph,
  GlobalRelationshipType,
} from "@/lib/graph/global-types";

export function findShortestGlobalPath({
  graph,
  startId,
  targetId,
  allowedRelationships,
  maxDepth = 6,
}: {
  graph: GlobalIntelligenceGraph;
  startId: string;
  targetId: string;
  allowedRelationships?: GlobalRelationshipType[];
  maxDepth?: number;
}): GlobalGraphPath {
  if (startId === targetId) {
    return { found: true, nodeIds: [startId], relationshipIds: [], distance: 0 };
  }

  const adjacency = new Map<string, Array<{ targetId: string; relationshipId: string }>>();

  for (const relationship of graph.relationships) {
    if (allowedRelationships && !allowedRelationships.includes(relationship.type)) continue;

    const forward = adjacency.get(relationship.sourceId) ?? [];
    forward.push({ targetId: relationship.targetId, relationshipId: relationship.id });
    adjacency.set(relationship.sourceId, forward);

    const reverse = adjacency.get(relationship.targetId) ?? [];
    reverse.push({ targetId: relationship.sourceId, relationshipId: relationship.id });
    adjacency.set(relationship.targetId, reverse);
  }

  const queue = [{ nodeId: startId, nodeIds: [startId], relationshipIds: [] as string[] }];
  const visited = new Set([startId]);

  while (queue.length) {
    const current = queue.shift()!;
    if (current.relationshipIds.length >= maxDepth) continue;

    for (const edge of adjacency.get(current.nodeId) ?? []) {
      if (visited.has(edge.targetId)) continue;

      const nodeIds = [...current.nodeIds, edge.targetId];
      const relationshipIds = [...current.relationshipIds, edge.relationshipId];

      if (edge.targetId === targetId) {
        return { found: true, nodeIds, relationshipIds, distance: relationshipIds.length };
      }

      visited.add(edge.targetId);
      queue.push({ nodeId: edge.targetId, nodeIds, relationshipIds });
    }
  }

  return { found: false, nodeIds: [], relationshipIds: [], distance: -1 };
}
