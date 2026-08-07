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
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";
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
  buildCollectorPreferenceEmbedding,
} from "@/lib/embedding/collector-preference";

describe("Collector preference embedding", () => {
  it("derives a versioned 21-dimensional collector representation", () => {
    const events: [] =
      [];
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
          buildPredictiveSnapshot({
            collection:
              demoCollection,
            catalog:
              bundledIntelligenceCatalog,
            events,
          }),
        collectionForecast:
          forecastCollection({
            collection:
              demoCollection,
            catalog:
              bundledIntelligenceCatalog,
            profile:
              demoProfile,
            events,
          }),
      });

    const embedding =
      buildCollectorPreferenceEmbedding({
        state,
        catalog:
          bundledIntelligenceCatalog,
      });

    expect(
      embedding.modelVersion,
    ).toBe(
      "PEM-1.0.0",
    );
    expect(
      Object.keys(
        embedding.dimensions,
      ).length,
    ).toBe(
      21,
    );
  });
});
