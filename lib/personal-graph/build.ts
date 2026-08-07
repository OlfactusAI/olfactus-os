import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  MemoryEvent,
} from "@/lib/memory/types";
import type {
  CanonicalCollectorState,
} from "@/lib/collector-state/types";
import type {
  PersonalGraphEdge,
  PersonalGraphNode,
  PersonalIntelligenceGraph,
} from "@/lib/personal-graph/types";

const collectorNodeId = "collector:self";

export function buildPersonalIntelligenceGraph({
  state,
  catalog,
  events,
}: {
  state: CanonicalCollectorState;
  catalog: FragranceRecord[];
  events: MemoryEvent[];
}): PersonalIntelligenceGraph {
  const nodes = new Map<string, PersonalGraphNode>();
  const edges = new Map<string, PersonalGraphEdge>();

  addNode(nodes, {
    id: collectorNodeId,
    type: "collector",
    label: "Collector",
    confidence: state.confidence.overall,
    metadata: {
      collectionSize: state.collection.length,
      rotationStyle: state.behavior.rotationStyle,
    },
  });

  const fragranceById = new Map(
    catalog.map((fragrance) => [fragrance.id, fragrance]),
  );

  for (const ownership of state.ownership) {
    const fragrance = fragranceById.get(ownership.fragranceId);
    const nodeId = fragranceNodeId(ownership.fragranceId);

    addNode(nodes, {
      id: nodeId,
      type: "fragrance",
      label: fragrance
        ? `${fragrance.brand} ${fragrance.name}`
        : ownership.fragranceId,
      globalEntityId: ownership.fragranceId,
      confidence: 100,
      metadata: {
        owned: true,
        wearCount: ownership.wearCount,
        daysSinceLastWear: ownership.daysSinceLastWear,
        favorite: ownership.favorite,
        personalRating: ownership.personalRating,
      },
    });

    addEdge(edges, {
      id: `owns:${ownership.fragranceId}`,
      from: collectorNodeId,
      to: nodeId,
      type: "owns",
      weight: 100,
      confidence: 100,
      evidenceCount: 1,
    });

    if (ownership.wearCount > 0) {
      addEdge(edges, {
        id: `wore:${ownership.fragranceId}`,
        from: collectorNodeId,
        to: nodeId,
        type: "wore",
        weight: Math.min(100, ownership.wearCount * 8),
        confidence: 100,
        evidenceCount: Math.max(
          ownership.wearCount,
          ownership.memoryWearCount,
        ),
      });
    }

    if (ownership.favorite) {
      addEdge(edges, {
        id: `favorite:${ownership.fragranceId}`,
        from: collectorNodeId,
        to: nodeId,
        type: "favorite",
        weight: 100,
        confidence: 100,
        evidenceCount: 1,
      });
    }
  }

  for (const affinity of state.preferences.families.slice(0, 12)) {
    const nodeId = `family:${affinity.id}`;

    addNode(nodes, {
      id: nodeId,
      type: "family",
      label: affinity.label,
      confidence: affinity.confidence,
      metadata: {
        score: affinity.score,
        direction: affinity.direction,
      },
    });

    addEdge(edges, {
      id: `prefers-family:${affinity.id}`,
      from: collectorNodeId,
      to: nodeId,
      type: "prefers",
      weight: affinity.score,
      confidence: affinity.confidence,
      evidenceCount: affinity.evidenceCount,
    });
  }

  for (const affinity of state.preferences.accords.slice(0, 16)) {
    const nodeId = `accord:${affinity.id}`;

    addNode(nodes, {
      id: nodeId,
      type: "accord",
      label: affinity.label,
      confidence: affinity.confidence,
      metadata: {
        score: affinity.score,
        direction: affinity.direction,
      },
    });

    addEdge(edges, {
      id: `prefers-accord:${affinity.id}`,
      from: collectorNodeId,
      to: nodeId,
      type: "prefers",
      weight: affinity.score,
      confidence: affinity.confidence,
      evidenceCount: affinity.evidenceCount,
    });
  }

  for (const trait of state.preferences.collectorDna.slice(0, 10)) {
    const nodeId = `collector-dna:${trait.id}`;

    addNode(nodes, {
      id: nodeId,
      type: "collector-dna",
      label: trait.label,
      confidence: trait.confidence,
      metadata: {
        score: trait.score,
        direction: trait.direction,
      },
    });

    addEdge(edges, {
      id: `collector-dna:${trait.id}`,
      from: collectorNodeId,
      to: nodeId,
      type: "prefers",
      weight: trait.score,
      confidence: trait.confidence,
      evidenceCount: trait.evidenceCount,
    });
  }

  addEventRelationships({
    nodes,
    edges,
    events,
    fragranceById,
  });

  for (const prediction of state.prediction.snapshot.bottlePredictions) {
    const nodeId = fragranceNodeId(prediction.fragranceId);

    if (!nodes.has(nodeId)) {
      const fragrance = fragranceById.get(prediction.fragranceId);

      addNode(nodes, {
        id: nodeId,
        type: "fragrance",
        label: fragrance
          ? `${fragrance.brand} ${fragrance.name}`
          : prediction.fragranceName,
        globalEntityId: prediction.fragranceId,
        confidence: prediction.confidence,
        metadata: {
          owned: false,
        },
      });
    }

    if (prediction.signaturePotential >= 75) {
      addEdge(edges, {
        id: `predicted-signature:${prediction.fragranceId}`,
        from: collectorNodeId,
        to: nodeId,
        type: "predicted-signature",
        weight: prediction.signaturePotential,
        confidence: prediction.confidence,
        evidenceCount: prediction.evidence.length,
      });
    }

    if (prediction.retentionRisk >= 65) {
      addEdge(edges, {
        id: `predicted-risk:${prediction.fragranceId}`,
        from: collectorNodeId,
        to: nodeId,
        type: "predicted-risk",
        weight: prediction.retentionRisk,
        confidence: prediction.confidence,
        evidenceCount: prediction.evidence.length,
      });
    }
  }

  const nodeList = [...nodes.values()];
  const edgeList = [...edges.values()];

  return {
    schemaVersion: 1,
    graphVersion: "PIG-1.0.0",
    generatedAt: state.generatedAt,
    nodes: nodeList,
    edges: edgeList,
    stats: {
      nodeCount: nodeList.length,
      edgeCount: edgeList.length,
      fragranceNodeCount: nodeList.filter(
        (node) => node.type === "fragrance",
      ).length,
      preferenceEdgeCount: edgeList.filter(
        (edge) => edge.type === "prefers",
      ).length,
    },
  };
}

function addEventRelationships({
  nodes,
  edges,
  events,
  fragranceById,
}: {
  nodes: Map<string, PersonalGraphNode>;
  edges: Map<string, PersonalGraphEdge>;
  events: MemoryEvent[];
  fragranceById: Map<string, FragranceRecord>;
}) {
  const grouped = new Map<
    string,
    {
      type: "viewed" | "visited" | "simulated";
      targetId: string;
      label: string;
      count: number;
      first?: string;
      last?: string;
      nodeType: "fragrance" | "workspace";
    }
  >();

  for (const event of events) {
    let type: "viewed" | "visited" | "simulated" | undefined;
    let targetId: string | undefined;
    let label: string | undefined;
    let nodeType: "fragrance" | "workspace" | undefined;

    if (
      event.type === "fragrance-viewed" &&
      event.entity?.type === "fragrance"
    ) {
      type = "viewed";
      targetId = event.entity.id;
      const fragrance = fragranceById.get(targetId);
      label =
        event.entity.label ??
        (fragrance
          ? `${fragrance.brand} ${fragrance.name}`
          : targetId);
      nodeType = "fragrance";
    } else if (event.type === "navigation") {
      type = "visited";
      targetId =
        event.entity?.type === "workspace"
          ? event.entity.id
          : typeof event.metadata.pathname === "string"
            ? event.metadata.pathname
            : undefined;
      label = targetId;
      nodeType = "workspace";
    } else if (
      event.type === "simulation-created" &&
      event.entity?.type === "fragrance"
    ) {
      type = "simulated";
      targetId = event.entity.id;
      label = event.entity.label ?? targetId;
      nodeType = "fragrance";
    }

    if (!type || !targetId || !label || !nodeType) continue;

    const key = `${type}:${targetId}`;
    const current = grouped.get(key);

    grouped.set(key, {
      type,
      targetId,
      label,
      nodeType,
      count: (current?.count ?? 0) + 1,
      first: current?.first ?? event.timestamp,
      last: event.timestamp,
    });
  }

  for (const item of grouped.values()) {
    const nodeId =
      item.nodeType === "fragrance"
        ? fragranceNodeId(item.targetId)
        : `workspace:${item.targetId}`;

    addNode(nodes, {
      id: nodeId,
      type: item.nodeType,
      label: item.label,
      globalEntityId:
        item.nodeType === "fragrance"
          ? item.targetId
          : undefined,
      confidence: 100,
      metadata: {},
    });

    addEdge(edges, {
      id: `${item.type}:${item.targetId}`,
      from: collectorNodeId,
      to: nodeId,
      type: item.type,
      weight: Math.min(100, item.count * 12),
      confidence: 100,
      firstObservedAt: item.first,
      lastObservedAt: item.last,
      evidenceCount: item.count,
    });
  }
}

function fragranceNodeId(fragranceId: string) {
  return `fragrance:${fragranceId}`;
}

function addNode(
  nodes: Map<string, PersonalGraphNode>,
  node: PersonalGraphNode,
) {
  const existing = nodes.get(node.id);

  nodes.set(
    node.id,
    existing
      ? {
          ...existing,
          ...node,
          metadata: {
            ...existing.metadata,
            ...node.metadata,
          },
          confidence: Math.max(
            existing.confidence,
            node.confidence,
          ),
        }
      : node,
  );
}

function addEdge(
  edges: Map<string, PersonalGraphEdge>,
  edge: PersonalGraphEdge,
) {
  const existing = edges.get(edge.id);

  edges.set(
    edge.id,
    existing
      ? {
          ...existing,
          ...edge,
          evidenceCount: Math.max(
            existing.evidenceCount,
            edge.evidenceCount,
          ),
          firstObservedAt:
            existing.firstObservedAt ??
            edge.firstObservedAt,
          lastObservedAt:
            edge.lastObservedAt ??
            existing.lastObservedAt,
        }
      : edge,
  );
}
