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

describe("Canonical Collector State", () => {
  it("creates one versioned collector snapshot across intelligence layers", () => {
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
    const forecast =
      forecastCollection({
        collection:
          demoCollection,
        catalog:
          fragrances,
        profile:
          demoProfile,
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
          forecast,
      });

    expect(
      state.stateVersion,
    ).toBe(
      "COLLECTOR-STATE-1.0.0",
    );
    expect(
      state.ownership.length,
    ).toBe(
      demoCollection.length,
    );
    expect(
      state.prediction
        .collectionForecast
        .modelVersion,
    ).toBe(
      "CF-3.2.0-alpha.1",
    );
    expect(
      state.confidence
        .provenance.model,
    ).toBe(
      "COLLECTOR-STATE-1.0.0",
    );
  });
});
