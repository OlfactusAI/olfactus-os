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

function fixture() {
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

  return {
    state,
    graph,
  };
}

describe("Unified Registry", () => {
  it("resolves collector, catalog, personal graph, and global graph from one registry", () => {
    const {
      state,
      graph,
    } = fixture();

    const registry =
      createUnifiedRegistry({
        state,
        graph,
        catalog:
          fragrances,
      });

    const first =
      demoCollection[0];

    expect(
      registry.registryVersion,
    ).toBe(
      "UNIFIED-REGISTRY-1.1.0",
    );
    expect(
      registry.resolveFragrance(
        first.fragranceId,
      )?.id,
    ).toBe(
      first.fragranceId,
    );
    expect(
      registry.resolveCollectionItem(
        first.fragranceId,
      )?.fragranceId,
    ).toBe(
      first.fragranceId,
    );
    expect(
      registry.isOwned(
        first.fragranceId,
      ),
    ).toBe(true);
    expect(
      registry.graph.personal
        .graphVersion,
    ).toBe(
      "PIG-1.0.0",
    );
    expect(
      registry.graph.global
        .graph.entities.length,
    ).toBeGreaterThan(
      0,
    );
  });

  it("deduplicates the catalog by canonical fragrance id", () => {
    const {
      state,
      graph,
    } = fixture();

    const duplicate =
      fragrances[0];

    const registry =
      createUnifiedRegistry({
        state,
        graph,
        catalog: [
          ...fragrances,
          duplicate,
        ],
      });

    expect(
      registry.catalog.records
        .length,
    ).toBe(
      fragrances.length,
    );
  });
});
