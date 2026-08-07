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
  createPlatformEventBus,
} from "@/lib/platform/event-bus";
import {
  createUnifiedRegistry,
} from "@/lib/platform/unified-registry";
import {
  createUnifiedIntelligenceContext,
  invalidateUnifiedIntelligenceContext,
} from "@/lib/platform/intelligence-context";

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
  const eventBus =
    createPlatformEventBus();
  const registry =
    createUnifiedRegistry({
      state,
      graph,
      catalog:
        fragrances,
      eventBus,
    });

  return {
    registry,
    eventBus,
  };
}

describe("Unified Intelligence Context", () => {
  it("creates one immutable deterministic snapshot from the Unified Registry", () => {
    const { registry } =
      fixture();

    const first =
      createUnifiedIntelligenceContext({
        registry,
      });
    const second =
      createUnifiedIntelligenceContext({
        registry,
      });

    expect(
      first.contextVersion,
    ).toBe(
      "UIC-1.0.0",
    );
    expect(
      first.contextId,
    ).toBe(
      second.contextId,
    );
    expect(
      first.collector,
    ).toBe(
      registry.collector.state,
    );
    expect(
      first.catalog,
    ).toBe(
      registry.catalog.records,
    );
    expect(
      first.personalGraph,
    ).toBe(
      registry.graph.personal,
    );
    expect(
      Object.isFrozen(
        first,
      ),
    ).toBe(true);
  });

  it("publishes context lifecycle events", () => {
    const {
      registry,
      eventBus,
    } = fixture();

    const context =
      createUnifiedIntelligenceContext({
        registry,
      });

    invalidateUnifiedIntelligenceContext({
      registry,
      contextId:
        context.contextId,
      reason:
        "collector-state-refreshed",
    });

    expect(
      eventBus.history(
        "platform.context.created",
      ).at(-1)?.payload.contextId,
    ).toBe(
      context.contextId,
    );
    expect(
      eventBus.history(
        "platform.context.invalidated",
      ).at(-1)?.payload.reason,
    ).toBe(
      "collector-state-refreshed",
    );
  });
});
