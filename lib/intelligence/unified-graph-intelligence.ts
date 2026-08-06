import type { FragranceRecord } from "@/lib/domain/fragrance";
import type { KnowledgeGraph } from "@/lib/graph/types";
import {
  buildKnowledgeGraph,
  getBridgeFragrances,
  getNeighbors,
  scoreFragranceRelationship,
} from "@/lib/intelligence/knowledge-graph-engine";

export interface UnifiedGraphSignal {
  fragranceId: string;
  overlap: number;
  expansionValue: number;
  bridgeValue: number;
  strategicValue: number;
  relatedFragrances: Array<{
    fragranceId: string;
    name: string;
    strength: number;
  }>;
  explanation: string;
}

export function createUnifiedKnowledgeGraph({
  catalog,
  ownedIds,
}: {
  catalog: FragranceRecord[];
  ownedIds: Set<string>;
}) {
  return buildKnowledgeGraph({
    catalog,
    ownedIds,
  });
}

export function getUnifiedGraphSignal({
  graph,
  catalog,
  fragranceId,
}: {
  graph: KnowledgeGraph;
  catalog: FragranceRecord[];
  fragranceId: string;
}): UnifiedGraphSignal {
  const node = graph.nodes.find(
    (item) =>
      item.type === "fragrance" &&
      item.fragranceId === fragranceId,
  );

  if (!node) {
    return emptySignal(fragranceId);
  }

  const neighbors = getNeighbors(
    graph,
    node.id,
    0,
  ).filter(
    (entry) =>
      entry.node.type === "fragrance",
  );

  const ownedNeighbors = neighbors.filter(
    (entry) => entry.node.owned,
  );
  const overlap =
    ownedNeighbors[0]?.edge.strength ?? 0;
  const expansionValue =
    Math.max(0, 100 - overlap);

  const bridgeValue =
    getBridgeFragrances(graph).find(
      (item) =>
        item.fragranceId === fragranceId,
    )?.bridgeScore ?? 0;

  const strategicValue = Math.round(
    Math.min(
      100,
      expansionValue * 0.42 +
        bridgeValue * 0.38 +
        (node.owned ? 8 : 14) +
        (node.score ?? 70) * 0.12,
    ),
  );

  const fragrance = catalog.find(
    (item) => item.id === fragranceId,
  );

  return {
    fragranceId,
    overlap,
    expansionValue,
    bridgeValue,
    strategicValue,
    relatedFragrances: neighbors
      .slice(0, 5)
      .map((entry) => ({
        fragranceId:
          entry.node.fragranceId ??
          entry.node.id,
        name: entry.node.label,
        strength: entry.edge.strength,
      })),
    explanation: `${fragrance?.name ?? node.label} has ${overlap}% maximum owned overlap, ${expansionValue}/100 expansion value, and ${bridgeValue}/100 bridge value. Its unified strategic value is ${strategicValue}/100.`,
  };
}

export function getRelatedFragrances(
  graph: KnowledgeGraph,
  fragranceId: string,
) {
  const node = graph.nodes.find(
    (item) =>
      item.type === "fragrance" &&
      item.fragranceId === fragranceId,
  );
  if (!node) return [];

  return getNeighbors(graph, node.id, 0)
    .filter(
      (entry) =>
        entry.node.type === "fragrance",
    )
    .map((entry) => ({
      node: entry.node,
      relationship: entry.edge,
    }));
}

export function getOverlap({
  catalog,
  firstId,
  secondId,
}: {
  catalog: FragranceRecord[];
  firstId: string;
  secondId: string;
}) {
  const first = catalog.find(
    (item) => item.id === firstId,
  );
  const second = catalog.find(
    (item) => item.id === secondId,
  );
  if (!first || !second) return 0;

  return scoreFragranceRelationship(
    first,
    second,
  ).overall;
}

export function explainGraphRecommendation(
  signal: UnifiedGraphSignal,
) {
  if (signal.overlap >= 82) {
    return "This candidate sits inside a dense existing collection region and may add limited new value.";
  }
  if (
    signal.bridgeValue >= 80 &&
    signal.expansionValue >= 45
  ) {
    return "This candidate is strategically valuable because it connects scent regions while still expanding the collection.";
  }
  if (signal.expansionValue >= 70) {
    return "This candidate opens a meaningfully new scent direction with limited redundancy.";
  }
  return "This candidate offers a balanced relationship to the current collection, with moderate familiarity and expansion.";
}

function emptySignal(
  fragranceId: string,
): UnifiedGraphSignal {
  return {
    fragranceId,
    overlap: 0,
    expansionValue: 0,
    bridgeValue: 0,
    strategicValue: 0,
    relatedFragrances: [],
    explanation:
      "No graph signal is available for this fragrance.",
  };
}
