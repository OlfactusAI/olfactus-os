import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  KnowledgeGraph,
  KnowledgeGraphNode,
} from "@/lib/graph/types";
import {
  getBridgeFragrances,
  getGraphMetrics,
  getNeighbors,
  scoreFragranceRelationship,
} from "@/lib/intelligence/knowledge-graph-engine";

export interface GraphIntelligenceInsight {
  id: string;
  category:
    | "cluster"
    | "bridge"
    | "isolation"
    | "redundancy"
    | "expansion"
    | "preference";
  title: string;
  explanation: string;
  score: number;
  nodeId?: string;
}

export interface GraphIntelligenceOutput {
  modelVersion: "GI-1.0.0";
  briefing: string;
  strongestCluster: string;
  strongestBridge: string;
  mostIsolatedBottle: string;
  mostRedundantPair: string;
  bestExpansionCandidate: string;
  insights: GraphIntelligenceInsight[];
}

export function analyzeGraphIntelligence({
  graph,
  catalog,
}: {
  graph: KnowledgeGraph;
  catalog: FragranceRecord[];
}): GraphIntelligenceOutput {
  const metrics = getGraphMetrics(graph);
  const bridges =
    getBridgeFragrances(graph);
  const ownedNodes =
    graph.nodes.filter(
      (node) =>
        node.type === "fragrance" &&
        node.owned,
    );

  const isolated = ownedNodes
    .map((node) => ({
      node,
      strength: average(
        getNeighbors(
          graph,
          node.id,
          0,
        )
          .filter(
            (entry) =>
              entry.node.type ===
              "fragrance",
          )
          .map(
            (entry) =>
              entry.edge.strength,
          ),
      ),
    }))
    .sort(
      (a, b) =>
        a.strength - b.strength,
    )[0];

  const redundantPairs = catalog
    .flatMap((first, index) =>
      catalog
        .slice(index + 1)
        .map((second) => ({
          first,
          second,
          score:
            scoreFragranceRelationship(
              first,
              second,
            ).overall,
        })),
    )
    .sort((a, b) => b.score - a.score);

  const expansionCandidate =
    catalog
      .filter(
        (candidate) =>
          graph.nodes.some(
            (node) =>
              node.type ===
                "fragrance" &&
              node.fragranceId ===
                candidate.id &&
              node.candidate,
          ),
      )
      .map((candidate) => {
        const maximumOverlap =
          ownedNodes.length > 0
            ? Math.max(
                ...ownedNodes.map(
                  (ownedNode) => {
                    const owned =
                      catalog.find(
                        (item) =>
                          item.id ===
                          ownedNode.fragranceId,
                      );
                    return owned
                      ? scoreFragranceRelationship(
                          candidate,
                          owned,
                        ).overall
                      : 0;
                  },
                ),
              )
            : 0;

        return {
          candidate,
          expansion:
            100 - maximumOverlap,
        };
      })
      .sort(
        (a, b) =>
          b.expansion -
          a.expansion,
      )[0];

  const insights: GraphIntelligenceInsight[] =
    [];

  if (metrics.largestCluster) {
    insights.push({
      id: "largest-cluster",
      category: "cluster",
      title: `${metrics.largestCluster.label} dominates the graph`,
      explanation: `${metrics.largestCluster.nodeIds.length} fragrance nodes form the largest ecosystem with ${metrics.largestCluster.averageStrength}/100 average internal strength.`,
      score:
        metrics.largestCluster.averageStrength,
    });
  }

  if (bridges[0]) {
    const node = graph.nodes.find(
      (item) =>
        item.type === "fragrance" &&
        item.fragranceId ===
          bridges[0].fragranceId,
    );

    insights.push({
      id: "strongest-bridge",
      category: "bridge",
      title: `${bridges[0].fragranceName} is the strongest bridge`,
      explanation: `It connects otherwise separate scent regions with a ${bridges[0].bridgeScore}/100 bridge score.`,
      score: bridges[0].bridgeScore,
      nodeId: node?.id,
    });
  }

  if (isolated) {
    insights.push({
      id: "most-isolated",
      category: "isolation",
      title: `${isolated.node.label} is the most isolated owned bottle`,
      explanation: `Its average fragrance-to-fragrance relationship strength is only ${isolated.strength}/100, making it strategically distinctive.`,
      score: 100 - isolated.strength,
      nodeId: isolated.node.id,
    });
  }

  if (redundantPairs[0]) {
    insights.push({
      id: "redundant-pair",
      category: "redundancy",
      title: `${redundantPairs[0].first.name} and ${redundantPairs[0].second.name} form the densest overlap`,
      explanation: `Their overall relationship score is ${redundantPairs[0].score}/100.`,
      score: redundantPairs[0].score,
    });
  }

  if (expansionCandidate) {
    const node = graph.nodes.find(
      (item) =>
        item.type === "fragrance" &&
        item.fragranceId ===
          expansionCandidate.candidate.id,
    );

    insights.push({
      id: "expansion-candidate",
      category: "expansion",
      title: `${expansionCandidate.candidate.name} offers the strongest expansion`,
      explanation: `It adds ${expansionCandidate.expansion}/100 novelty against the closest owned bottle.`,
      score:
        expansionCandidate.expansion,
      nodeId: node?.id,
    });
  }

  const strongestCluster =
    metrics.largestCluster?.label ??
    "Still calibrating";
  const strongestBridge =
    bridges[0]?.fragranceName ??
    "Still calibrating";
  const isolatedName =
    isolated?.node.label ??
    "Still calibrating";
  const redundantPair =
    redundantPairs[0]
      ? `${redundantPairs[0].first.name} + ${redundantPairs[0].second.name}`
      : "Still calibrating";
  const expansionName =
    expansionCandidate?.candidate
      .name ?? "Still calibrating";

  return {
    modelVersion: "GI-1.0.0",
    briefing: `Your collection graph is led by the ${strongestCluster} ecosystem. ${strongestBridge} currently provides the strongest bridge between scent regions, while ${isolatedName} remains the most isolated bottle. The densest overlap appears between ${redundantPair}. ${expansionName} is the clearest next expansion candidate.`,
    strongestCluster,
    strongestBridge,
    mostIsolatedBottle:
      isolatedName,
    mostRedundantPair:
      redundantPair,
    bestExpansionCandidate:
      expansionName,
    insights: insights.sort(
      (a, b) => b.score - a.score,
    ),
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length,
  );
}
