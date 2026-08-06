import type {
  DnaDimension,
  FragranceRecord,
  Season,
} from "@/lib/domain/fragrance";
import type {
  BridgeFragrance,
  GraphMetrics,
  GraphQuery,
  KnowledgeGraph,
  KnowledgeGraphCluster,
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  RelationshipBreakdown,
} from "@/lib/graph/types";

const dnaDimensions: DnaDimension[] = [
  "fresh",
  "green",
  "woody",
  "amber",
  "sweet",
  "dark",
  "artistic",
  "formal",
];

const seasons: Season[] = [
  "spring",
  "summer",
  "fall",
  "winter",
];

export function buildKnowledgeGraph({
  catalog,
  ownedIds,
}: {
  catalog: FragranceRecord[];
  ownedIds: Set<string>;
}): KnowledgeGraph {
  const nodes = new Map<
    string,
    KnowledgeGraphNode
  >();
  const edges: KnowledgeGraphEdge[] = [];

  for (const fragrance of catalog) {
    const fragranceNodeId =
      nodeId("fragrance", fragrance.id);

    nodes.set(fragranceNodeId, {
      id: fragranceNodeId,
      type: "fragrance",
      label: fragrance.name,
      subtitle: fragrance.brand,
      fragranceId: fragrance.id,
      brand: fragrance.brand,
      family: fragrance.family,
      owned: ownedIds.has(fragrance.id),
      candidate: !ownedIds.has(fragrance.id),
      score:
        fragrance.intelligence?.confidence ??
        78,
      metadata: {
        concentration: fragrance.concentration,
        family: fragrance.family,
        roles: fragrance.roles,
        moods: fragrance.moods,
        longevity:
          fragrance.performance.longevity,
        projection:
          fragrance.performance.projection,
      },
    });

    linkFacet({
      nodes,
      edges,
      source: fragranceNodeId,
      type: "brand",
      value: fragrance.brand,
      edgeType: "belongs-to-brand",
      strength: 100,
      explanation: `${fragrance.name} belongs to ${fragrance.brand}.`,
    });

    linkFacet({
      nodes,
      edges,
      source: fragranceNodeId,
      type: "family",
      value: fragrance.family,
      edgeType: "belongs-to-family",
      strength: 96,
      explanation: `${fragrance.name} is classified as ${fragrance.family}.`,
    });

    for (const perfumer of fragrance.perfumers ?? []) {
      linkFacet({
        nodes,
        edges,
        source: fragranceNodeId,
        type: "perfumer",
        value: perfumer,
        edgeType: "created-by",
        strength: 100,
        explanation: `${fragrance.name} was created by ${perfumer}.`,
      });
    }

    for (const accord of fragrance.accords ?? []) {
      linkFacet({
        nodes,
        edges,
        source: fragranceNodeId,
        type: "accord",
        value: accord,
        edgeType: "has-accord",
        strength: 86,
        explanation: `${accord} is a recorded accord in ${fragrance.name}.`,
      });
    }

    const notes = Array.from(
      new Set([
        ...(fragrance.notes?.top ?? []),
        ...(fragrance.notes?.heart ?? []),
        ...(fragrance.notes?.base ?? []),
      ]),
    );

    for (const note of notes) {
      linkFacet({
        nodes,
        edges,
        source: fragranceNodeId,
        type: "note",
        value: note,
        edgeType: "contains-note",
        strength: 82,
        explanation: `${note} appears in the note structure of ${fragrance.name}.`,
      });
    }

    for (const role of fragrance.roles) {
      linkFacet({
        nodes,
        edges,
        source: fragranceNodeId,
        type: "role",
        value: role,
        edgeType: "fits-role",
        strength: 84,
        explanation: `${fragrance.name} supports the ${role} role.`,
      });
    }

    for (const season of seasons) {
      if (fragrance.seasons[season] < 75) {
        continue;
      }

      linkFacet({
        nodes,
        edges,
        source: fragranceNodeId,
        type: "season",
        value: season,
        edgeType: "best-in-season",
        strength: fragrance.seasons[season],
        explanation: `${fragrance.name} scores ${fragrance.seasons[season]}/100 in ${season}.`,
      });
    }

    for (const dimension of dnaDimensions) {
      if (fragrance.dna[dimension] < 68) {
        continue;
      }

      linkFacet({
        nodes,
        edges,
        source: fragranceNodeId,
        type: "dna",
        value: dimension,
        edgeType: "expresses-dna",
        strength: fragrance.dna[dimension],
        explanation: `${fragrance.name} expresses ${dimension} DNA at ${fragrance.dna[dimension]}/100.`,
      });
    }
  }

  for (let firstIndex = 0; firstIndex < catalog.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < catalog.length;
      secondIndex += 1
    ) {
      const first = catalog[firstIndex];
      const second = catalog[secondIndex];
      const relationship =
        scoreFragranceRelationship(
          first,
          second,
        );

      if (relationship.overall < 48) {
        continue;
      }

      const type =
        relationship.overall >= 82
          ? "high-overlap"
          : relationship.overall >= 65
            ? "similar-to"
            : "complements";

      edges.push({
        id: edgeId(
          nodeId("fragrance", first.id),
          nodeId("fragrance", second.id),
          type,
        ),
        source: nodeId(
          "fragrance",
          first.id,
        ),
        target: nodeId(
          "fragrance",
          second.id,
        ),
        type,
        strength: relationship.overall,
        explanation:
          relationshipExplanation(
            first,
            second,
            relationship,
            type,
          ),
      });
    }
  }

  const graphNodes = [...nodes.values()];
  const clusters = detectClusters({
    catalog,
    edges,
  });

  return {
    version: "KGE-1.0.0",
    generatedAt: new Date().toISOString(),
    nodes: graphNodes,
    edges,
    clusters,
  };
}

export function scoreFragranceRelationship(
  first: FragranceRecord,
  second: FragranceRecord,
): RelationshipBreakdown {
  const dnaSimilarity = cosineSimilarity(
    dnaDimensions.map(
      (dimension) => first.dna[dimension],
    ),
    dnaDimensions.map(
      (dimension) => second.dna[dimension],
    ),
  );

  const roleSimilarity = jaccard(
    first.roles,
    second.roles,
  );

  const seasonalSimilarity =
    cosineSimilarity(
      seasons.map(
        (season) => first.seasons[season],
      ),
      seasons.map(
        (season) => second.seasons[season],
      ),
    );

  const familySimilarity =
    first.family === second.family
      ? 100
      : tokenSimilarity(
          first.family,
          second.family,
        );

  const performanceSimilarity =
    100 -
    Math.min(
      100,
      (Math.abs(
        first.performance.longevity -
          second.performance.longevity,
      ) +
        Math.abs(
          first.performance.projection -
            second.performance.projection,
        )) /
        2,
    );

  return {
    dnaSimilarity,
    roleSimilarity,
    seasonalSimilarity,
    familySimilarity,
    performanceSimilarity,
    overall: Math.round(
      dnaSimilarity * 0.42 +
        roleSimilarity * 0.2 +
        seasonalSimilarity * 0.17 +
        familySimilarity * 0.11 +
        performanceSimilarity * 0.1,
    ),
  };
}

export function getNeighbors(
  graph: KnowledgeGraph,
  nodeIdValue: string,
  minimumStrength = 0,
) {
  const nodeMap = new Map(
    graph.nodes.map((node) => [
      node.id,
      node,
    ]),
  );

  return graph.edges
    .filter(
      (edge) =>
        edge.strength >= minimumStrength &&
        (edge.source === nodeIdValue ||
          edge.target === nodeIdValue),
    )
    .map((edge) => {
      const neighborId =
        edge.source === nodeIdValue
          ? edge.target
          : edge.source;
      return {
        node: nodeMap.get(neighborId)!,
        edge,
      };
    })
    .filter((entry) => Boolean(entry.node))
    .sort(
      (a, b) =>
        b.edge.strength -
        a.edge.strength,
    );
}

export function getGraphMetrics(
  graph: KnowledgeGraph,
): GraphMetrics {
  const connectionCounts = new Map<
    string,
    number
  >();

  for (const edge of graph.edges) {
    connectionCounts.set(
      edge.source,
      (connectionCounts.get(edge.source) ??
        0) + 1,
    );
    connectionCounts.set(
      edge.target,
      (connectionCounts.get(edge.target) ??
        0) + 1,
    );
  }

  const mostConnectedNodeId =
    [...connectionCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] ?? null;

  const bridges = getBridgeFragrances(
    graph,
  );

  const fragranceCount =
    graph.nodes.filter(
      (node) => node.type === "fragrance",
    ).length;

  const possibleRelationships =
    fragranceCount > 1
      ? (fragranceCount *
          (fragranceCount - 1)) /
        2
      : 1;

  const fragranceRelationships =
    graph.edges.filter(
      (edge) =>
        edge.source.startsWith(
          "fragrance:",
        ) &&
        edge.target.startsWith(
          "fragrance:",
        ),
    ).length;

  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    fragranceCount,
    averageRelationshipStrength:
      average(
        graph.edges.map(
          (edge) => edge.strength,
        ),
      ),
    mostConnectedNodeId,
    strongestBridge: bridges[0] ?? null,
    largestCluster:
      [...graph.clusters].sort(
        (a, b) =>
          b.nodeIds.length -
          a.nodeIds.length,
      )[0] ?? null,
    connectivity: Math.round(
      Math.min(
        100,
        (fragranceRelationships /
          possibleRelationships) *
          100,
      ),
    ),
  };
}

export function getBridgeFragrances(
  graph: KnowledgeGraph,
): BridgeFragrance[] {
  const fragranceNodes =
    graph.nodes.filter(
      (node) => node.type === "fragrance",
    );

  return fragranceNodes
    .map((node) => {
      const connectedClusters =
        graph.clusters.filter(
          (cluster) =>
            cluster.nodeIds.some(
              (clusterNodeId) =>
                getNeighbors(
                  graph,
                  node.id,
                  48,
                ).some(
                  (entry) =>
                    entry.node.id ===
                    clusterNodeId,
                ),
            ),
        );

      const strongNeighbors =
        getNeighbors(
          graph,
          node.id,
          60,
        ).filter(
          (entry) =>
            entry.node.type ===
            "fragrance",
        );

      const bridgeScore = Math.round(
        Math.min(
          100,
          connectedClusters.length * 22 +
            strongNeighbors.length * 7 +
            average(
              strongNeighbors.map(
                (entry) =>
                  entry.edge.strength,
              ),
            ) *
              0.25,
        ),
      );

      return {
        fragranceId:
          node.fragranceId ?? node.id,
        fragranceName: node.label,
        bridgeScore,
        clusterConnections:
          connectedClusters.map(
            (cluster) => cluster.label,
          ),
      };
    })
    .sort(
      (a, b) =>
        b.bridgeScore - a.bridgeScore,
    );
}

export function queryKnowledgeGraph(
  graph: KnowledgeGraph,
  query: GraphQuery,
) {
  const normalized =
    query.text?.trim().toLowerCase() ??
    "";

  return graph.nodes
    .filter((node) => {
      if (
        query.nodeTypes?.length &&
        !query.nodeTypes.includes(node.type)
      ) {
        return false;
      }

      if (
        query.ownedOnly &&
        !node.owned
      ) {
        return false;
      }

      if (
        normalized &&
        ![
          node.label,
          node.subtitle,
          node.brand,
          node.family,
          ...(Object.values(
            node.metadata ?? {},
          ).flatMap((value) =>
            Array.isArray(value)
              ? value
              : [String(value)],
          )),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.owned !== b.owned) {
        return a.owned ? -1 : 1;
      }
      return a.label.localeCompare(
        b.label,
      );
    });
}

export function findRecommendationPath({
  graph,
  startFragranceId,
  maximumSteps = 5,
}: {
  graph: KnowledgeGraph;
  startFragranceId: string;
  maximumSteps?: number;
}) {
  const startId = nodeId(
    "fragrance",
    startFragranceId,
  );
  const path: KnowledgeGraphNode[] = [];
  const visited = new Set<string>();
  let currentId: string | null = startId;

  while (
    currentId &&
    path.length < maximumSteps
  ) {
    const current = graph.nodes.find(
      (node) => node.id === currentId,
    );
    if (!current) break;

    path.push(current);
    visited.add(currentId);

    const nextEntry:
      | {
          node: KnowledgeGraphNode;
          edge: KnowledgeGraphEdge;
        }
      | undefined = getNeighbors(
      graph,
      currentId,
      48,
    )
      .filter(
        (entry) =>
          entry.node.type === "fragrance" &&
          !visited.has(entry.node.id),
      )
      .sort((a, b) => {
        const aValue =
          (a.node.owned ? -20 : 15) +
          (a.edge.type === "complements"
            ? 12
            : 0) +
          a.edge.strength;
        const bValue =
          (b.node.owned ? -20 : 15) +
          (b.edge.type === "complements"
            ? 12
            : 0) +
          b.edge.strength;
        return bValue - aValue;
      })[0];

    currentId =
      nextEntry?.node.id ?? null;
  }

  return path;
}

function detectClusters({
  catalog,
  edges,
}: {
  catalog: FragranceRecord[];
  edges: KnowledgeGraphEdge[];
}): KnowledgeGraphCluster[] {
  const unvisited = new Set(
    catalog.map((item) => item.id),
  );
  const clusters: KnowledgeGraphCluster[] =
    [];

  while (unvisited.size) {
    const firstId =
      unvisited.values().next()
        .value as string;
    const queue = [firstId];
    const members: string[] = [];
    unvisited.delete(firstId);

    while (queue.length) {
      const current = queue.shift()!;
      members.push(current);

      const currentNodeId = nodeId(
        "fragrance",
        current,
      );

      const connectedIds = edges
        .filter(
          (edge) =>
            edge.strength >= 64 &&
            edge.source.startsWith(
              "fragrance:",
            ) &&
            edge.target.startsWith(
              "fragrance:",
            ) &&
            (edge.source ===
              currentNodeId ||
              edge.target ===
                currentNodeId),
        )
        .map((edge) =>
          edge.source === currentNodeId
            ? edge.target.replace(
                "fragrance:",
                "",
              )
            : edge.source.replace(
                "fragrance:",
                "",
              ),
        );

      for (const connectedId of connectedIds) {
        if (unvisited.has(connectedId)) {
          unvisited.delete(connectedId);
          queue.push(connectedId);
        }
      }
    }

    const fragrances = members
      .map((id) =>
        catalog.find(
          (item) => item.id === id,
        ),
      )
      .filter(Boolean) as FragranceRecord[];

    const dominantDna =
      dnaDimensions
        .map((dimension) => ({
          dimension,
          value: average(
            fragrances.map(
              (fragrance) =>
                fragrance.dna[dimension],
            ),
          ),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((item) => item.dimension);

    const internalStrengths =
      edges
        .filter(
          (edge) =>
            members.some(
              (id) =>
                edge.source ===
                nodeId(
                  "fragrance",
                  id,
                ),
            ) &&
            members.some(
              (id) =>
                edge.target ===
                nodeId(
                  "fragrance",
                  id,
                ),
            ),
        )
        .map((edge) => edge.strength);

    clusters.push({
      id: `cluster-${clusters.length + 1}`,
      label: clusterLabel(
        dominantDna,
      ),
      nodeIds: members.map((id) =>
        nodeId("fragrance", id),
      ),
      dominantDna,
      averageStrength:
        average(internalStrengths),
    });
  }

  return clusters.sort(
    (a, b) =>
      b.nodeIds.length -
      a.nodeIds.length,
  );
}

function clusterLabel(
  dimensions: DnaDimension[],
) {
  return dimensions
    .slice(0, 2)
    .map(capitalize)
    .join(" ");
}

function linkFacet({
  nodes,
  edges,
  source,
  type,
  value,
  edgeType,
  strength,
  explanation,
}: {
  nodes: Map<
    string,
    KnowledgeGraphNode
  >;
  edges: KnowledgeGraphEdge[];
  source: string;
  type:
    | "brand"
    | "perfumer"
    | "note"
    | "accord"
    | "family"
    | "role"
    | "season"
    | "dna";
  value: string;
  edgeType:
    | "belongs-to-brand"
    | "created-by"
    | "contains-note"
    | "has-accord"
    | "belongs-to-family"
    | "fits-role"
    | "best-in-season"
    | "expresses-dna";
  strength: number;
  explanation: string;
}) {
  const target = nodeId(type, value);

  if (!nodes.has(target)) {
    nodes.set(target, {
      id: target,
      type,
      label: capitalize(value),
    });
  }

  edges.push({
    id: edgeId(
      source,
      target,
      edgeType,
    ),
    source,
    target,
    type: edgeType,
    strength,
    explanation,
  });
}

function relationshipExplanation(
  first: FragranceRecord,
  second: FragranceRecord,
  score: RelationshipBreakdown,
  type:
    | "high-overlap"
    | "similar-to"
    | "complements",
) {
  if (type === "high-overlap") {
    return `${first.name} and ${second.name} occupy a closely related region with ${score.dnaSimilarity}% DNA similarity.`;
  }

  if (type === "similar-to") {
    return `${first.name} and ${second.name} share a meaningful relationship across DNA, roles, and seasonal behavior.`;
  }

  return `${first.name} and ${second.name} are different enough to expand one another while retaining a navigable connection.`;
}

function nodeId(
  type: string,
  value: string,
) {
  return `${type}:${slug(value)}`;
}

function edgeId(
  source: string,
  target: string,
  type: string,
) {
  return `${type}:${source}->${target}`;
}

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cosineSimilarity(
  first: number[],
  second: number[],
) {
  let dot = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (
    let index = 0;
    index < first.length;
    index += 1
  ) {
    dot += first[index] * second[index];
    firstMagnitude +=
      first[index] ** 2;
    secondMagnitude +=
      second[index] ** 2;
  }

  return Math.round(
    Math.min(
      100,
      Math.max(
        0,
        (dot /
          (Math.sqrt(firstMagnitude) *
            Math.sqrt(secondMagnitude) ||
            1)) *
          100,
      ),
    ),
  );
}

function jaccard(
  first: string[],
  second: string[],
) {
  const firstSet = new Set(first);
  const secondSet = new Set(second);
  const intersection = [...firstSet].filter(
    (item) => secondSet.has(item),
  ).length;
  const union = new Set([
    ...first,
    ...second,
  ]).size;

  return Math.round(
    (intersection /
      Math.max(1, union)) *
      100,
  );
}

function tokenSimilarity(
  first: string,
  second: string,
) {
  const firstTokens =
    first.toLowerCase().split(/\s+/);
  const secondTokens =
    second.toLowerCase().split(/\s+/);
  return jaccard(
    firstTokens,
    secondTokens,
  );
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

function capitalize(value: string) {
  return value
    .split(/[-\s]+/)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}
