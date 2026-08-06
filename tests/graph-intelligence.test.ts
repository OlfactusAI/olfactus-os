import { describe, expect, it } from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { buildKnowledgeGraph } from "@/lib/intelligence/knowledge-graph-engine";
import {
  executeNeuralGraphSearch,
  parseNeuralGraphQuery,
} from "@/lib/intelligence/neural-graph-search";
import { analyzeGraphIntelligence } from "@/lib/intelligence/graph-intelligence-engine";

describe("Graph Intelligence and Neural Search", () => {
  const graph = buildKnowledgeGraph({
    catalog: fragrances,
    ownedIds: new Set(
      demoCollection.map(
        (item) => item.fragranceId,
      ),
    ),
  });

  it("parses natural-language graph intents", () => {
    expect(
      parseNeuralGraphQuery(
        "show fragrances closest to Ganymede",
      ).intent,
    ).toBe("closest-to");

    expect(
      parseNeuralGraphQuery(
        "which candidate expands my collection the most?",
      ).intent,
    ).toBe("maximum-expansion");

    expect(
      parseNeuralGraphQuery(
        "show office fragrances with low overlap",
      ).role,
    ).toBe("office");
  });

  it("returns ranked neural graph results", () => {
    const query =
      parseNeuralGraphQuery(
        "show fragrances closest to Ganymede",
      );

    const result =
      executeNeuralGraphSearch({
        graph,
        catalog: fragrances,
        query,
      });

    expect(result.modelVersion).toBe("NGS-1.0.0");
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.answer.length).toBeGreaterThan(20);
  });

  it("generates dynamic graph intelligence insights", () => {
    const result =
      analyzeGraphIntelligence({
        graph,
        catalog: fragrances,
      });

    expect(result.modelVersion).toBe("GI-1.0.0");
    expect(result.insights.length).toBeGreaterThan(2);
    expect(result.briefing.length).toBeGreaterThan(100);
    expect(result.strongestBridge.length).toBeGreaterThan(0);
  });
});
