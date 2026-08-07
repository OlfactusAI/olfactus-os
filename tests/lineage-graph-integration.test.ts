import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  KnowledgeGraph,
} from "@/lib/graph/types";
import type {
  LineageIntelligenceOutput,
} from "@/lib/lineage/types";
import {
  augmentKnowledgeGraphWithLineage,
} from "@/lib/intelligence/lineage-graph-integration";

describe("Lineage graph integration", () => {
  it("adds lineage nodes and edges", () => {
    const graph: KnowledgeGraph = {
      version: "KGE-1.0.0",
      generatedAt: "2026-08-06T00:00:00.000Z",
      nodes: [
        {
          id: "fragrance:a",
          type: "fragrance",
          label: "A",
          fragranceId: "a",
        },
        {
          id: "fragrance:b",
          type: "fragrance",
          label: "B",
          fragranceId: "b",
        },
      ],
      edges: [],
      clusters: [],
    };

    const lineage: LineageIntelligenceOutput = {
      modelVersion: "LIE-1.0.0",
      generatedAt: "2026-08-06T00:00:00.000Z",
      lines: [
        {
          id: "line-a",
          canonicalName: "A",
          brandId: "brand-a",
          originalFragranceId: "a",
          members: [
            {
              fragranceId: "a",
              lineId: "line-a",
              generation: 0,
              releaseOrder: 1,
              relationship: "original",
              status: "active",
              concentrationId: "edt",
              dnaInheritance: 100,
              evolutionScore: 0,
              originalityScore: 100,
              performanceDelta: {
                longevity: 0,
                projection: 0,
                sillage: null,
              },
              dnaDeltas: [],
              children: ["b"],
              inspiredByIds: [],
              cloneOfIds: [],
              confidence: 95,
            },
            {
              fragranceId: "b",
              lineId: "line-a",
              parentId: "a",
              generation: 1,
              releaseOrder: 2,
              relationship: "flanker",
              status: "active",
              concentrationId: "edp",
              dnaInheritance: 82,
              evolutionScore: 28,
              originalityScore: 35,
              performanceDelta: {
                longevity: 10,
                projection: 5,
                sillage: null,
              },
              dnaDeltas: [],
              children: [],
              inspiredByIds: [],
              cloneOfIds: [],
              confidence: 95,
            },
          ],
          chronology: ["a", "b"],
          activeMemberIds: ["a", "b"],
          discontinuedMemberIds: [],
          averageInheritance: 91,
          averageEvolution: 14,
          confidence: 95,
        },
      ],
      nodes: [],
      edges: [
        {
          sourceId: "a",
          targetId: "b",
          type: "parent-child",
          confidence: 95,
        },
      ],
      orphanFragranceIds: [],
    };

    const result = augmentKnowledgeGraphWithLineage({
      graph,
      lineage,
    });

    expect(
      result.nodes.some((node) => node.type === "lineage"),
    ).toBe(true);
    expect(
      result.edges.some(
        (edge) => edge.type === "belongs-to-lineage",
      ),
    ).toBe(true);
    expect(
      result.edges.some(
        (edge) => edge.type === "lineage-parent",
      ),
    ).toBe(true);
  });
});
