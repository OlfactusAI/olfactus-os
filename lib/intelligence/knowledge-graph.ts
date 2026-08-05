import type { FragranceRecord } from "@/lib/domain/fragrance";
import type {
  KnowledgeEdge,
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeRelationType,
} from "@/lib/domain/knowledge-graph";

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function nodeId(type: KnowledgeNode["type"], label: string) {
  return `${type}:${normalize(label)}`;
}

function edgeId(
  from: string,
  relation: KnowledgeRelationType,
  to: string,
) {
  return `${from}__${relation}__${to}`;
}

function addNode(
  nodes: Map<string, KnowledgeNode>,
  node: KnowledgeNode,
) {
  if (!nodes.has(node.id)) {
    nodes.set(node.id, node);
  }
}

function addEdge(
  edges: Map<string, KnowledgeEdge>,
  edge: KnowledgeEdge,
) {
  if (!edges.has(edge.id)) {
    edges.set(edge.id, edge);
  }
}

export function buildKnowledgeGraph(
  fragrances: FragranceRecord[],
  now = new Date(),
): KnowledgeGraph {
  const nodes = new Map<string, KnowledgeNode>();
  const edges = new Map<string, KnowledgeEdge>();

  fragrances.forEach((fragrance) => {
    const fragranceId = nodeId("fragrance", fragrance.id);

    addNode(nodes, {
      id: fragranceId,
      type: "fragrance",
      label: `${fragrance.brand} ${fragrance.name}`,
      metadata: {
        canonicalId: fragrance.id,
        concentration: fragrance.concentration,
        intelligenceStatus: fragrance.intelligenceStatus,
      },
    });

    const brandId = nodeId("brand", fragrance.brand);

    addNode(nodes, {
      id: brandId,
      type: "brand",
      label: fragrance.brand,
    });

    addEdge(edges, {
      id: edgeId(fragranceId, "made-by", brandId),
      from: fragranceId,
      to: brandId,
      relation: "made-by",
      weight: 100,
    });

    const familyId = nodeId("family", fragrance.family);

    addNode(nodes, {
      id: familyId,
      type: "family",
      label: fragrance.family,
    });

    addEdge(edges, {
      id: edgeId(fragranceId, "belongs-to-family", familyId),
      from: fragranceId,
      to: familyId,
      relation: "belongs-to-family",
      weight: 100,
    });

    fragrance.perfumers?.forEach((perfumer) => {
      const perfumerId = nodeId("perfumer", perfumer);

      addNode(nodes, {
        id: perfumerId,
        type: "perfumer",
        label: perfumer,
      });

      addEdge(edges, {
        id: edgeId(fragranceId, "created-by", perfumerId),
        from: fragranceId,
        to: perfumerId,
        relation: "created-by",
        weight: 100,
      });
    });

    fragrance.accords?.forEach((accord, index) => {
      const accordId = nodeId("accord", accord);

      addNode(nodes, {
        id: accordId,
        type: "accord",
        label: accord,
      });

      addEdge(edges, {
        id: edgeId(fragranceId, "has-accord", accordId),
        from: fragranceId,
        to: accordId,
        relation: "has-accord",
        weight: Math.max(55, 95 - index * 8),
      });
    });

    const notes = [
      ...(fragrance.notes?.top ?? []),
      ...(fragrance.notes?.heart ?? []),
      ...(fragrance.notes?.base ?? []),
    ];

    [...new Set(notes)].forEach((note) => {
      const noteNodeId = nodeId("note", note);

      addNode(nodes, {
        id: noteNodeId,
        type: "note",
        label: note,
      });

      addEdge(edges, {
        id: edgeId(fragranceId, "has-note", noteNodeId),
        from: fragranceId,
        to: noteNodeId,
        relation: "has-note",
        weight: 78,
      });
    });

    fragrance.roles.forEach((role) => {
      const roleId = nodeId("role", role);

      addNode(nodes, {
        id: roleId,
        type: "role",
        label: role,
      });

      addEdge(edges, {
        id: edgeId(fragranceId, "supports-role", roleId),
        from: fragranceId,
        to: roleId,
        relation: "supports-role",
        weight: 90,
      });
    });

    Object.entries(fragrance.seasons).forEach(
      ([season, score]) => {
        const seasonId = nodeId("season", season);

        addNode(nodes, {
          id: seasonId,
          type: "season",
          label: season,
        });

        addEdge(edges, {
          id: edgeId(
            fragranceId,
            "suited-for-season",
            seasonId,
          ),
          from: fragranceId,
          to: seasonId,
          relation: "suited-for-season",
          weight: score,
        });
      },
    );

    fragrance.moods.forEach((mood) => {
      const moodId = nodeId("mood", mood);

      addNode(nodes, {
        id: moodId,
        type: "mood",
        label: mood,
      });

      addEdge(edges, {
        id: edgeId(fragranceId, "expresses-mood", moodId),
        from: fragranceId,
        to: moodId,
        relation: "expresses-mood",
        weight: 82,
      });
    });

    if (fragrance.countryOfOrigin) {
      const countryId = nodeId(
        "country",
        fragrance.countryOfOrigin,
      );

      addNode(nodes, {
        id: countryId,
        type: "country",
        label: fragrance.countryOfOrigin,
      });

      addEdge(edges, {
        id: edgeId(
          fragranceId,
          "originates-from",
          countryId,
        ),
        from: fragranceId,
        to: countryId,
        relation: "originates-from",
        weight: 100,
      });
    }

    if (fragrance.climate) {
      const climateScores = {
        "high-heat": fragrance.climate.highHeat,
        humid: fragrance.climate.humidity,
        cold: fragrance.climate.cold,
        dry: fragrance.climate.dryClimate,
      };

      Object.entries(climateScores).forEach(
        ([climate, score]) => {
          const climateId = nodeId("climate", climate);

          addNode(nodes, {
            id: climateId,
            type: "climate",
            label: climate,
          });

          addEdge(edges, {
            id: edgeId(
              fragranceId,
              "suited-for-climate",
              climateId,
            ),
            from: fragranceId,
            to: climateId,
            relation: "suited-for-climate",
            weight: score,
          });
        },
      );
    }
  });

  return {
    nodes: [...nodes.values()],
    edges: [...edges.values()],
    version: "KG-1.0.0",
    generatedAt: now.toISOString(),
  };
}