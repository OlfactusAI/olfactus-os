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
  deriveCanonicalCollectorState,
} from "@/lib/collector-state/derive";
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
  buildPersonalIntelligenceGraph,
} from "@/lib/personal-graph/build";
import {
  createUnifiedRegistry,
} from "@/lib/platform/unified-registry";
import {
  createPlatformEventBus,
} from "@/lib/platform/event-bus";

describe("Unified Registry event integration", () => {
  it("reuses the provided runtime bus and publishes a registry refresh event", () => {
    const events: [] = [];
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

    const bus =
      createPlatformEventBus();

    const registry =
      createUnifiedRegistry({
        state,
        graph,
        catalog:
          fragrances,
        eventBus:
          bus,
      });

    expect(
      registry.events,
    ).toBe(bus);
    expect(
      registry.registryVersion,
    ).toBe(
      "UNIFIED-REGISTRY-1.1.0",
    );

    const refresh =
      bus.history(
        "platform.registry.refreshed",
      )[0];

    expect(refresh).toBeTruthy();
    expect(
      refresh.payload.catalogCount,
    ).toBe(
      registry.catalog.records.length,
    );
  });
});
