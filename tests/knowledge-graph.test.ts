import { describe, expect, it } from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import {
  buildKnowledgeGraph,
  findRecommendationPath,
  getBridgeFragrances,
  getGraphMetrics,
  getNeighbors,
  queryKnowledgeGraph,
  scoreFragranceRelationship,
} from "@/lib/intelligence/knowledge-graph-engine";

describe("Knowledge Graph Engine", () => {
  const ownedIds = new Set(
    demoCollection.map(
      (item) => item.fragranceId,
    ),
  );

  const graph = buildKnowledgeGraph({
    catalog: fragrances,
    ownedIds,
  });

  it("builds fragrance, brand, family, role, season, and DNA nodes", () => {
    expect(graph.version).toBe("KGE-1.0.0");
    expect(
      graph.nodes.filter(
        (node) =>
          node.type === "fragrance",
      ),
    ).toHaveLength(fragrances.length);
    expect(
      graph.nodes.some(
        (node) => node.type === "brand",
      ),
    ).toBe(true);
    expect(
      graph.nodes.some(
        (node) => node.type === "dna",
      ),
    ).toBe(true);
    expect(graph.edges.length).toBeGreaterThan(20);
  });

  it("scores fragrance relationships consistently", () => {
    const first = fragrances[0];
    const second = fragrances[1];
    const score =
      scoreFragranceRelationship(
        first,
        second,
      );

    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(score.dnaSimilarity).toBeGreaterThan(0);
  });

  it("supports graph APIs for neighbors, bridges, metrics, queries, and paths", () => {
    const firstNode =
      graph.nodes.find(
        (node) =>
          node.type === "fragrance",
      )!;

    expect(
      getNeighbors(graph, firstNode.id).length,
    ).toBeGreaterThan(0);
    expect(
      getBridgeFragrances(graph).length,
    ).toBe(fragrances.length);
    expect(
      getGraphMetrics(graph).nodeCount,
    ).toBe(graph.nodes.length);
    expect(
      queryKnowledgeGraph(graph, {
        text: firstNode.label,
      }).length,
    ).toBeGreaterThan(0);

    const path = findRecommendationPath({
      graph,
      startFragranceId:
        firstNode.fragranceId!,
    });

    expect(path.length).toBeGreaterThan(0);
    expect(path.length).toBeLessThanOrEqual(5);
  });

  it("detects at least one collection cluster", () => {
    expect(graph.clusters.length).toBeGreaterThan(0);
    expect(
      graph.clusters[0].dominantDna.length,
    ).toBe(3);
  });
});
