import type {
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
} from "@/lib/graph/types";
import type {
  LineageIntelligenceOutput,
} from "@/lib/lineage/types";

export function augmentKnowledgeGraphWithLineage({
  graph,
  lineage,
}: {
  graph: KnowledgeGraph;
  lineage: LineageIntelligenceOutput;
}): KnowledgeGraph {
  const nodes: KnowledgeGraphNode[] = [
    ...graph.nodes,
  ];
  const edges: KnowledgeGraphEdge[] = [
    ...graph.edges,
  ];
  const knownNodes =
    new Set(
      nodes.map((node) => node.id),
    );
  const knownEdges =
    new Set(
      edges.map((edge) => edge.id),
    );

  for (const line of lineage.lines) {
    const lineNodeId =
      `lineage:${line.id}`;

    if (!knownNodes.has(lineNodeId)) {
      nodes.push({
        id: lineNodeId,
        type: "lineage",
        label: line.canonicalName,
        subtitle: `${line.members.length} releases`,
        score: line.confidence,
        metadata: {
          originalFragranceId:
            line.originalFragranceId,
          memberCount:
            line.members.length,
          averageInheritance:
            line.averageInheritance,
          averageEvolution:
            line.averageEvolution,
        },
      });
      knownNodes.add(lineNodeId);
    }

    for (const member of line.members) {
      const fragranceNodeId =
        `fragrance:${member.fragranceId}`;
      if (
        !knownNodes.has(
          fragranceNodeId,
        )
      ) {
        continue;
      }

      addEdge({
        edges,
        knownEdges,
        edge: {
          id: `lineage-membership:${member.fragranceId}:${line.id}`,
          source:
            fragranceNodeId,
          target:
            lineNodeId,
          type: "belongs-to-lineage",
          strength:
            member.dnaInheritance,
          explanation:
            `${member.fragranceId} belongs to the ${line.canonicalName} lineage with ${member.dnaInheritance}% inherited DNA.`,
        },
      });
    }
  }

  for (const edge of lineage.edges) {
    const source =
      `fragrance:${edge.sourceId}`;
    const target =
      `fragrance:${edge.targetId}`;

    if (
      !knownNodes.has(source) ||
      !knownNodes.has(target)
    ) {
      continue;
    }

    addEdge({
      edges,
      knownEdges,
      edge: {
        id: `lineage:${edge.type}:${edge.sourceId}:${edge.targetId}`,
        source,
        target,
        type:
          edge.type ===
          "parent-child"
            ? "lineage-parent"
            : edge.type ===
                "successor"
              ? "lineage-successor"
              : edge.type ===
                  "clone"
                ? "lineage-clone"
                : edge.type ===
                    "inspired-by"
                  ? "lineage-inspired-by"
                  : "same-lineage",
        strength:
          edge.confidence,
        explanation:
          `Lineage relationship: ${edge.type.replaceAll(
            "-",
            " ",
          )}.`,
      },
    });
  }

  return {
    ...graph,
    nodes,
    edges,
  };
}

function addEdge({
  edges,
  knownEdges,
  edge,
}: {
  edges: KnowledgeGraphEdge[];
  knownEdges: Set<string>;
  edge: KnowledgeGraphEdge;
}) {
  if (knownEdges.has(edge.id)) {
    return;
  }

  edges.push(edge);
  knownEdges.add(edge.id);
}
