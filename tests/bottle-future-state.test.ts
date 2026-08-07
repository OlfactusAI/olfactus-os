import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoCollection,
} from "@/lib/data/demo";
import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  buildPredictiveSnapshot,
} from "@/lib/predictive/prediction-engine";
import {
  forecastBottleStates,
} from "@/lib/prediction/forecast-bottles";

describe("Bottle future-state classifier", () => {
  it("returns recognized future states for owned bottles", () => {
    const snapshot =
      buildPredictiveSnapshot({
        collection:
          demoCollection,
        catalog:
          fragrances,
        events: [],
      });

    const states =
      forecastBottleStates({
        projectedCollection:
          demoCollection,
        catalog:
          fragrances,
        events: [],
        predictiveSnapshot:
          snapshot,
        horizonDays: 90,
      });

    const valid =
      new Set([
        "core-rotation",
        "stable",
        "watch",
        "neglect-risk",
        "seasonal-hold",
        "signature-candidate",
        "emerging-favorite",
        "removal-candidate",
        "likely-repurchase",
        "archive",
      ]);

    expect(
      states.length,
    ).toBeGreaterThan(
      0,
    );

    for (
      const state
      of states
    ) {
      expect(
        valid.has(
          state.state,
        ),
      ).toBe(true);
    }
  });
});
