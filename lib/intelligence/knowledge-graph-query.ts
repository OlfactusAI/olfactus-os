import type {
  GraphNeighbor,
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeNodeType,
  KnowledgeRelationType,
} from "@/lib/domain/knowledge-graph";

export function getNode(
  graph: KnowledgeGraph,
  nodeId: string,
) {
  return graph.nodes.find((node) => node.id === nodeId) ?? null;
}

export function findNodes(
  graph: KnowledgeGraph,
  query: string,
  type?: KnowledgeNodeType,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return graph.nodes.filter((node) => {
    const typeMatches = type ? node.type === type : true;
    const queryMatches = node.label
      .toLowerCase()
      .includes(normalizedQuery);

    return typeMatches && queryMatches;
  });
}

export function getNeighbors(
  graph: KnowledgeGraph,
  nodeId: string,
  relation?: KnowledgeRelationType,
): GraphNeighbor[] {
  return graph.edges
    .filter((edge) => {
      const connected =
        edge.from === nodeId || edge.to === nodeId;

      const relationMatches = relation
        ? edge.relation === relation
        : true;

      return connected && relationMatches;
    })
    .map((edge) => {
      const neighborId =
        edge.from === nodeId ? edge.to : edge.from;

      const node = getNode(graph, neighborId);

      return node ? { node, edge } : null;
    })
    .filter(
      (neighbor): neighbor is GraphNeighbor =>
        neighbor !== null,
    )
    .sort((a, b) => b.edge.weight - a.edge.weight);
}

export function getRelatedFragrances(
  graph: KnowledgeGraph,
  fragranceNodeId: string,
) {
  const sourceNeighbors = getNeighbors(
    graph,
    fragranceNodeId,
  );

  const relationshipWeights = new Map<string, number>();

  sourceNeighbors.forEach(({ node, edge }) => {
    const connectedFragrances = getNeighbors(
      graph,
      node.id,
    ).filter(
      ({ node: relatedNode }) =>
        relatedNode.type === "fragrance" &&
        relatedNode.id !== fragranceNodeId,
    );

    connectedFragrances.forEach(({ node: related }) => {
      const sharedWeight = Math.min(
        edge.weight,
        getNeighbors(graph, node.id).find(
          ({ node: candidate }) =>
            candidate.id === related.id,
        )?.edge.weight ?? 0,
      );

      relationshipWeights.set(
        related.id,
        (relationshipWeights.get(related.id) ?? 0) +
          sharedWeight,
      );
    });
  });

  return [...relationshipWeights.entries()]
    .map(([nodeId, score]) => ({
      node: getNode(graph, nodeId) as KnowledgeNode,
      score,
    }))
    .filter(({ node }) => node !== null)
    .sort((a, b) => b.score - a.score);
}