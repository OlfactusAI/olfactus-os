import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoCollection,
  demoProfile,
} from "@/lib/data/demo";
import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  summarizeMemory,
} from "@/lib/memory/queries";
import {
  buildPredictiveSnapshot,
} from "@/lib/predictive/prediction-engine";
import {
  forecastCollection,
} from "@/lib/prediction/collection-forecast";
import {
  deriveCanonicalCollectorState,
} from "@/lib/collector-state/derive";
import {
  buildPersonalIntelligenceGraph,
} from "@/lib/personal-graph/build";

describe("Personal Intelligence Graph", () => {
  it("layers personal ownership edges over global fragrance identifiers", () => {
    const events: [] =
      [];
    const predictive =
      buildPredictiveSnapshot({
        collection:
          demoCollection,
        catalog:
          fragrances,
        events,
      });
    const state =
      deriveCanonicalCollectorState({
        profile:
          demoProfile,
        collection:
          demoCollection,
        events,
        memorySummary:
          summarizeMemory(
            events,
          ),
        memoryInsights: [],
        collectorDna: [],
        predictiveSnapshot:
          predictive,
        collectionForecast:
          forecastCollection({
            collection:
              demoCollection,
            catalog:
              fragrances,
            profile:
              demoProfile,
            events,
          }),
      });

    const graph =
      buildPersonalIntelligenceGraph({
        state,
        catalog:
          fragrances,
        events,
      });

    expect(
      graph.graphVersion,
    ).toBe(
      "PIG-1.0.0",
    );
    expect(
      graph.edges.filter(
        (edge) =>
          edge.type ===
          "owns",
      ).length,
    ).toBe(
      demoCollection.length,
    );
    expect(
      graph.nodes
        .filter(
          (node) =>
            node.type ===
            "fragrance",
        )
        .every(
          (node) =>
            Boolean(
              node.globalEntityId,
            ),
        ),
    ).toBe(true);
  });
});
