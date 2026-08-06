import type {
  FragranceRecord,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";
import type {
  KnowledgeGraph,
  KnowledgeGraphNode,
} from "@/lib/graph/types";
import {
  getBridgeFragrances,
  getNeighbors,
  queryKnowledgeGraph,
  scoreFragranceRelationship,
} from "@/lib/intelligence/knowledge-graph-engine";

export type GraphSearchIntent =
  | "closest-to"
  | "bridge-between"
  | "underused-strategic"
  | "maximum-expansion"
  | "role-low-overlap"
  | "perfumer"
  | "family"
  | "notes"
  | "general";

export interface NeuralGraphQuery {
  raw: string;
  intent: GraphSearchIntent;
  anchor?: string;
  role?: FragranceRole;
  seasons?: Season[];
  terms: string[];
  ownedOnly?: boolean;
  candidatesOnly?: boolean;
}

export interface NeuralGraphResult {
  node: KnowledgeGraphNode;
  score: number;
  explanation: string;
  relationshipStrength?: number;
  novelty?: number;
  strategicValue?: number;
}

export interface NeuralGraphSearchOutput {
  modelVersion: "NGS-1.0.0";
  query: NeuralGraphQuery;
  answer: string;
  results: NeuralGraphResult[];
  path: KnowledgeGraphNode[];
}

const roles: FragranceRole[] = [
  "office",
  "casual",
  "date",
  "formal",
  "summer",
  "winter",
  "creative",
  "signature",
  "travel",
];

export function parseNeuralGraphQuery(
  raw: string,
): NeuralGraphQuery {
  const normalized = raw
    .trim()
    .toLowerCase();

  let intent: GraphSearchIntent =
    "general";

  if (
    normalized.includes("closest") ||
    normalized.includes("similar")
  ) {
    intent = "closest-to";
  } else if (
    normalized.includes("bridge") &&
    normalized.includes("between")
  ) {
    intent = "bridge-between";
  } else if (
    normalized.includes("underused") ||
    normalized.includes("strategic value")
  ) {
    intent = "underused-strategic";
  } else if (
    normalized.includes("expand") ||
    normalized.includes("expansion")
  ) {
    intent = "maximum-expansion";
  } else if (
    normalized.includes("low overlap")
  ) {
    intent = "role-low-overlap";
  } else if (
    normalized.includes("perfumer")
  ) {
    intent = "perfumer";
  } else if (
    normalized.includes("family")
  ) {
    intent = "family";
  } else if (
    normalized.includes("note") ||
    normalized.includes("accord")
  ) {
    intent = "notes";
  }

  const role = roles.find((value) =>
    normalized.includes(value),
  );

  const anchorMatch =
    raw.match(
      /(?:closest to|similar to|like|around)\s+(.+)$/i,
    );

  const terms = normalized
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(
      (term) =>
        term.length > 2 &&
        ![
          "show",
          "find",
          "which",
          "what",
          "fragrances",
          "fragrance",
          "bottles",
          "bottle",
          "with",
          "that",
          "from",
          "best",
          "most",
          "collection",
          "please",
        ].includes(term),
    );

  return {
    raw,
    intent,
    anchor: anchorMatch?.[1]?.trim(),
    role,
    terms,
    ownedOnly:
      normalized.includes("owned") ||
      normalized.includes("my collection"),
    candidatesOnly:
      normalized.includes("candidate") ||
      normalized.includes("next"),
  };
}

export function executeNeuralGraphSearch({
  graph,
  catalog,
  query,
  wearCounts,
}: {
  graph: KnowledgeGraph;
  catalog: FragranceRecord[];
  query: NeuralGraphQuery;
  wearCounts?: Map<string, number>;
}): NeuralGraphSearchOutput {
  switch (query.intent) {
    case "closest-to":
      return closestTo({
        graph,
        catalog,
        query,
      });

    case "bridge-between":
      return bridgeBetween({
        graph,
        query,
      });

    case "underused-strategic":
      return underusedStrategic({
        graph,
        query,
        wearCounts,
      });

    case "maximum-expansion":
      return maximumExpansion({
        graph,
        catalog,
        query,
      });

    case "role-low-overlap":
      return roleLowOverlap({
        graph,
        catalog,
        query,
      });

    default:
      return generalSearch({
        graph,
        query,
      });
  }
}

function closestTo({
  graph,
  catalog,
  query,
}: {
  graph: KnowledgeGraph;
  catalog: FragranceRecord[];
  query: NeuralGraphQuery;
}): NeuralGraphSearchOutput {
  const anchorText =
    query.anchor ??
    query.terms.join(" ");

  const anchorNode =
    graph.nodes
      .filter(
        (node) =>
          node.type === "fragrance",
      )
      .sort(
        (a, b) =>
          textScore(
            b.label,
            anchorText,
          ) -
          textScore(
            a.label,
            anchorText,
          ),
      )[0];

  if (!anchorNode?.fragranceId) {
    return emptyOutput(
      query,
      "No fragrance anchor could be resolved from that query.",
    );
  }

  const anchor = catalog.find(
    (item) =>
      item.id ===
      anchorNode.fragranceId,
  );

  if (!anchor) {
    return emptyOutput(
      query,
      "The fragrance exists in the graph but lacks a catalog record.",
    );
  }

  const results = catalog
    .filter(
      (item) => item.id !== anchor.id,
    )
    .map((candidate) => {
      const relationship =
        scoreFragranceRelationship(
          anchor,
          candidate,
        );

      const node = graph.nodes.find(
        (item) =>
          item.type === "fragrance" &&
          item.fragranceId ===
            candidate.id,
      )!;

      return {
        node,
        score:
          relationship.overall,
        relationshipStrength:
          relationship.overall,
        novelty:
          100 -
          relationship.dnaSimilarity,
        explanation: `${candidate.name} scores ${relationship.overall}/100 overall against ${anchor.name}, led by ${relationship.dnaSimilarity}/100 DNA similarity and ${relationship.seasonalSimilarity}/100 seasonal similarity.`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    modelVersion: "NGS-1.0.0",
    query,
    answer: `${anchor.name} is most closely connected to ${results
      .slice(0, 3)
      .map((result) => result.node.label)
      .join(", ")}.`,
    results,
    path: [
      anchorNode,
      ...results
        .slice(0, 4)
        .map((result) => result.node),
    ],
  };
}

function bridgeBetween({
  graph,
  query,
}: {
  graph: KnowledgeGraph;
  query: NeuralGraphQuery;
}): NeuralGraphSearchOutput {
  const bridges =
    getBridgeFragrances(graph);

  const results = bridges
    .slice(0, 6)
    .map(
      (
        bridge,
      ): NeuralGraphResult | null => {
        const node = graph.nodes.find(
          (item) =>
            item.type === "fragrance" &&
            item.fragranceId ===
              bridge.fragranceId,
        );

        if (!node) return null;

        return {
          node,
          score: bridge.bridgeScore,
          strategicValue:
            bridge.bridgeScore,
          explanation: `${bridge.fragranceName} connects ${Math.max(
            1,
            bridge.clusterConnections.length,
          )} detected scent ecosystems and carries a bridge score of ${bridge.bridgeScore}/100.`,
        };
      },
    )
    .filter(
      (
        item,
      ): item is NeuralGraphResult =>
        item !== null,
    );

  return {
    modelVersion: "NGS-1.0.0",
    query,
    answer: results[0]
      ? `${results[0].node.label} is currently the strongest bridge fragrance in the graph.`
      : "No bridge fragrance is available yet.",
    results,
    path: results
      .slice(0, 5)
      .map((result) => result.node),
  };
}

function underusedStrategic({
  graph,
  query,
  wearCounts,
}: {
  graph: KnowledgeGraph;
  query: NeuralGraphQuery;
  wearCounts?: Map<string, number>;
}): NeuralGraphSearchOutput {
  const bridges =
    getBridgeFragrances(graph);
  const bridgeMap = new Map(
    bridges.map((item) => [
      item.fragranceId,
      item.bridgeScore,
    ]),
  );

  const results = graph.nodes
    .filter(
      (node) =>
        node.type === "fragrance" &&
        node.owned &&
        node.fragranceId,
    )
    .map((node) => {
      const wears =
        wearCounts?.get(
          node.fragranceId!,
        ) ?? 0;
      const strategic =
        bridgeMap.get(
          node.fragranceId!,
        ) ?? 0;
      const score = Math.round(
        strategic * 0.72 +
          Math.max(
            0,
            100 - wears * 8,
          ) *
            0.28,
      );

      return {
        node,
        score,
        strategicValue: strategic,
        explanation: `${node.label} combines a ${strategic}/100 bridge score with only ${wears} recorded wears.`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    modelVersion: "NGS-1.0.0",
    query,
    answer: results[0]
      ? `${results[0].node.label} is the strongest underused strategic bottle currently detected.`
      : "No owned bottles are available for this analysis.",
    results,
    path: results.map(
      (result) => result.node,
    ),
  };
}

function maximumExpansion({
  graph,
  catalog,
  query,
}: {
  graph: KnowledgeGraph;
  catalog: FragranceRecord[];
  query: NeuralGraphQuery;
}): NeuralGraphSearchOutput {
  const owned = catalog.filter(
    (item) =>
      graph.nodes.some(
        (node) =>
          node.type === "fragrance" &&
          node.fragranceId ===
            item.id &&
          node.owned,
      ),
  );

  const candidates = catalog.filter(
    (item) =>
      graph.nodes.some(
        (node) =>
          node.type === "fragrance" &&
          node.fragranceId ===
            item.id &&
          node.candidate,
      ),
  );

  const results = candidates
    .map((candidate) => {
      const maximumOverlap =
        owned.length > 0
          ? Math.max(
              ...owned.map(
                (existing) =>
                  scoreFragranceRelationship(
                    candidate,
                    existing,
                  ).overall,
              ),
            )
          : 0;

      const novelty =
        100 - maximumOverlap;
      const roleBonus =
        query.role &&
        candidate.roles.includes(
          query.role,
        )
          ? 12
          : 0;
      const score = Math.round(
        Math.min(
          100,
          novelty * 0.78 +
            roleBonus +
            candidate.dna.artistic *
              0.1,
        ),
      );

      const node = graph.nodes.find(
        (item) =>
          item.type === "fragrance" &&
          item.fragranceId ===
            candidate.id,
      )!;

      return {
        node,
        score,
        novelty,
        explanation: `${candidate.name} has ${novelty}/100 novelty against the closest owned bottle and meaningfully expands the graph.`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    modelVersion: "NGS-1.0.0",
    query,
    answer: results[0]
      ? `${results[0].node.label} currently offers the strongest collection expansion.`
      : "No candidate fragrances are available.",
    results,
    path: results.map(
      (result) => result.node,
    ),
  };
}

function roleLowOverlap({
  graph,
  catalog,
  query,
}: {
  graph: KnowledgeGraph;
  catalog: FragranceRecord[];
  query: NeuralGraphQuery;
}): NeuralGraphSearchOutput {
  const role = query.role ?? "office";

  const owned = catalog.filter(
    (item) =>
      graph.nodes.some(
        (node) =>
          node.type === "fragrance" &&
          node.fragranceId ===
            item.id &&
          node.owned,
      ),
  );

  const results = catalog
    .filter(
      (item) =>
        item.roles.includes(role) &&
        graph.nodes.some(
          (node) =>
            node.type === "fragrance" &&
            node.fragranceId ===
              item.id &&
            node.candidate,
        ),
    )
    .map((candidate) => {
      const overlap =
        owned.length > 0
          ? Math.max(
              ...owned.map(
                (existing) =>
                  scoreFragranceRelationship(
                    candidate,
                    existing,
                  ).overall,
              ),
            )
          : 0;
      const score =
        100 - overlap;

      const node = graph.nodes.find(
        (item) =>
          item.type === "fragrance" &&
          item.fragranceId ===
            candidate.id,
      )!;

      return {
        node,
        score,
        novelty: score,
        explanation: `${candidate.name} supports the ${role} role while limiting maximum collection overlap to ${overlap}%.`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    modelVersion: "NGS-1.0.0",
    query,
    answer: results[0]
      ? `${results[0].node.label} is the lowest-overlap ${role} candidate.`
      : `No ${role} candidates were found.`,
    results,
    path: results.map(
      (result) => result.node,
    ),
  };
}

function generalSearch({
  graph,
  query,
}: {
  graph: KnowledgeGraph;
  query: NeuralGraphQuery;
}): NeuralGraphSearchOutput {
  const nodes = queryKnowledgeGraph(
    graph,
    {
      text: query.terms.join(" "),
      ownedOnly: query.ownedOnly,
    },
  ).slice(0, 8);

  const results = nodes.map(
    (node, index) => ({
      node,
      score: Math.max(
        50,
        100 - index * 7,
      ),
      explanation: `${node.label} matched the graph query across its label, metadata, and connected classification.`,
    }),
  );

  return {
    modelVersion: "NGS-1.0.0",
    query,
    answer: results.length
      ? `${results.length} relevant graph nodes were found.`
      : "No matching graph nodes were found.",
    results,
    path: results
      .filter(
        (result) =>
          result.node.type ===
          "fragrance",
      )
      .map((result) => result.node),
  };
}

function emptyOutput(
  query: NeuralGraphQuery,
  answer: string,
): NeuralGraphSearchOutput {
  return {
    modelVersion: "NGS-1.0.0",
    query,
    answer,
    results: [],
    path: [],
  };
}

function textScore(
  value: string,
  query: string,
) {
  const normalizedValue =
    value.toLowerCase();
  const normalizedQuery =
    query.toLowerCase();

  if (
    normalizedValue === normalizedQuery
  ) {
    return 100;
  }

  if (
    normalizedValue.includes(
      normalizedQuery,
    )
  ) {
    return 80;
  }

  const queryTerms =
    normalizedQuery.split(/\s+/);
  return queryTerms.reduce(
    (score, term) =>
      score +
      (normalizedValue.includes(term)
        ? 15
        : 0),
    0,
  );
}
