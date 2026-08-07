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
import {
  createIntelligenceApi,
} from "@/lib/intelligence-api";

describe("Unified Intelligence API", () => {
  it("serves collector, graph, prediction, and fragrance context from one interface", () => {
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
    const api =
      createIntelligenceApi({
        state,
        graph,
        catalog:
          fragrances,
      });

    expect(
      api.getCollectorState()
        .stateVersion,
    ).toBe(
      "COLLECTOR-STATE-1.0.0",
    );
    expect(
      api.getGraphContext()
        .graphVersion,
    ).toBe(
      "PIG-1.0.0",
    );
    expect(
      api.getPredictionContext()
        .collectionForecast
        .modelVersion,
    ).toBe(
      "CF-3.2.0-alpha.1",
    );

    const first =
      demoCollection[0];

    expect(
      api.getFragranceState(
        first.fragranceId,
      ).ownership
        ?.fragranceId,
    ).toBe(
      first.fragranceId,
    );
  });
});
