import type { GlobalGraphMetrics, GlobalIntelligenceGraph } from "@/lib/graph/global-types";

export function calculateGlobalGraphMetrics(graph: GlobalIntelligenceGraph): GlobalGraphMetrics {
  const degree = new Map(graph.entities.map((entity) => [entity.canonicalId, 0]));
  const adjacency = new Map(graph.entities.map((entity) => [entity.canonicalId, new Set<string>()]));
  const ids = new Set(graph.entities.map((entity) => entity.canonicalId));
  let brokenLinks = 0;

  for (const relationship of graph.relationships) {
    if (!ids.has(relationship.sourceId) || !ids.has(relationship.targetId)) {
      brokenLinks += 1;
      continue;
    }

    degree.set(relationship.sourceId, (degree.get(relationship.sourceId) ?? 0) + 1);
    degree.set(relationship.targetId, (degree.get(relationship.targetId) ?? 0) + 1);
    adjacency.get(relationship.sourceId)?.add(relationship.targetId);
    adjacency.get(relationship.targetId)?.add(relationship.sourceId);
  }

  const degrees = [...degree.values()];
  const orphanCount = degrees.filter((value) => value === 0).length;
  const component = componentMetrics(adjacency);
  const n = graph.entities.length;
  const maxEdges = n > 1 ? (n * (n - 1)) / 2 : 1;

  return {
    graphVersion: "GIN-1.0.0",
    entityCount: graph.entities.length,
    relationshipCount: graph.relationships.length,
    entityTypeCount: new Set(graph.entities.map((entity) => entity.type)).size,
    relationshipTypeCount: new Set(graph.relationships.map((relationship) => relationship.type)).size,
    averageDegree: degrees.length ? round(degrees.reduce((sum, value) => sum + value, 0) / degrees.length) : 0,
    density: round(Math.min(1, graph.relationships.length / maxEdges) * 100),
    connectedComponents: component.count,
    largestConnectedComponent: component.largest,
    orphanCount,
    integrityScore: Math.max(0, Math.round(100 - brokenLinks * 6 - orphanCount * 0.35)),
  };
}

function componentMetrics(adjacency: Map<string, Set<string>>) {
  const visited = new Set<string>();
  let count = 0;
  let largest = 0;

  for (const start of adjacency.keys()) {
    if (visited.has(start)) continue;
    count += 1;
    let size = 0;
    const queue = [start];
    visited.add(start);

    while (queue.length) {
      const current = queue.shift()!;
      size += 1;
      for (const neighbor of adjacency.get(current) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }

    largest = Math.max(largest, size);
  }

  return { count, largest };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
