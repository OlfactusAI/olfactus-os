import { describe, expect, it } from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import {
  buildKnowledgeGraph,
  scoreFragranceRelationship,
} from "@/lib/intelligence/knowledge-graph-engine";

describe("Immersive Graph Interface", () => {
  const graph = buildKnowledgeGraph({
    catalog: fragrances,
    ownedIds: new Set(
      demoCollection.map(
        (item) => item.fragranceId,
      ),
    ),
  });

  it("provides enough data for interactive graph filtering", () => {
    const types = new Set(
      graph.nodes.map((node) => node.type),
    );

    expect(types.has("fragrance")).toBe(true);
    expect(types.has("brand")).toBe(true);
    expect(types.has("family")).toBe(true);
    expect(graph.edges.length).toBeGreaterThan(20);
  });

  it("supports two-fragrance relationship comparison", () => {
    const first = fragrances[0];
    const second = fragrances[1];
    const relationship =
      scoreFragranceRelationship(
        first,
        second,
      );

    expect(relationship.overall).toBeGreaterThanOrEqual(0);
    expect(relationship.overall).toBeLessThanOrEqual(100);
    expect(relationship.performanceSimilarity).toBeGreaterThan(0);
  });
});
