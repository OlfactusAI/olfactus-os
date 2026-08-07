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
import {
  evaluateCandidateDecision,
  evaluateOwnedDecision,
} from "@/lib/decision-core/engine";

function buildApi() {
  const events: [] =
    [];
  const snapshot =
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
        snapshot,
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

  return createIntelligenceApi({
    state,
    graph,
    catalog:
      fragrances,
  });
}

describe("Unified Decision Core", () => {
  it("produces one bounded candidate decision with provenance", () => {
    const api =
      buildApi();
    const ownedIds =
      new Set(
        demoCollection.map(
          (item) =>
            item.fragranceId,
        ),
      );
    const candidate =
      fragrances.find(
        (fragrance) =>
          !ownedIds.has(
            fragrance.id,
          ),
      )!;

    const decision =
      evaluateCandidateDecision({
        api,
        candidateFragranceId:
          candidate.id,
      });

    expect([
      "buy",
      "sample",
      "wait",
      "skip",
      "replace",
    ]).toContain(
      decision.verdict,
    );
    expect(
      decision.score,
    ).toBeGreaterThanOrEqual(
      0,
    );
    expect(
      decision.score,
    ).toBeLessThanOrEqual(
      100,
    );
    expect(
      decision.provenance.model,
    ).toBe(
      "UDC-1.0.0",
    );
    expect(
      decision.factors.length,
    ).toBeGreaterThan(
      4,
    );
  });

  it("supports keep, revisit, or sell decisions for owned bottles", () => {
    const api =
      buildApi();
    const decision =
      evaluateOwnedDecision({
        api,
        fragranceId:
          demoCollection[0]
            .fragranceId,
      });

    expect([
      "keep",
      "revisit",
      "sell",
    ]).toContain(
      decision.verdict,
    );
  });
});
