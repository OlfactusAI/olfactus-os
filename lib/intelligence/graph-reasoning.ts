import type { KnowledgeGraph } from "@/lib/domain/knowledge-graph";
import { getNeighbors } from "@/lib/intelligence/knowledge-graph-query";

export interface GraphReason {
  title: string;
  weight: number;
}

export interface GraphExplanation {
  fragranceId: string;
  reasons: GraphReason[];
  confidence: number;
}

export function explainRecommendation(
  graph: KnowledgeGraph,
  fragranceNodeId: string,
): GraphExplanation {
  const neighbors = getNeighbors(graph, fragranceNodeId);

  const reasons = neighbors
    .slice(0, 6)
    .map((neighbor) => ({
      title: `${neighbor.edge.relation.replaceAll("-", " ")} • ${
        neighbor.node.label
      }`,
      weight: neighbor.edge.weight,
    }))
    .sort((a, b) => b.weight - a.weight);

  const confidence = Math.round(
    reasons.reduce((sum, reason) => sum + reason.weight, 0) /
      Math.max(reasons.length, 1),
  );

  return {
    fragranceId: fragranceNodeId,
    reasons,
    confidence,
  };
}