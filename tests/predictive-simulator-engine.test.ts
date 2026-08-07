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
  simulatePredictiveAddition,
} from "@/lib/predictive/simulator-engine";

describe("Predictive Simulator", () => {
  it("creates bounded forward-looking metrics", () => {
    const owned =
      new Set(
        demoCollection.map(
          (item) =>
            item.fragranceId,
        ),
      );
    const candidate =
      fragrances.find(
        (fragrance) =>
          !owned.has(
            fragrance.id,
          ),
      );

    expect(candidate).toBeTruthy();

    const result =
      simulatePredictiveAddition({
        fragranceId:
          candidate!.id,
        horizonDays: 180,
        collection:
          demoCollection,
        catalog:
          fragrances,
        events: [],
        currentHealth: 82,
      });

    expect(result).toBeTruthy();
    expect(
      result!.metrics.projectedHealthLow,
    ).toBeGreaterThanOrEqual(0);
    expect(
      result!.metrics.projectedHealthHigh,
    ).toBeLessThanOrEqual(100);
    expect(
      result!.metrics.neglectRisk,
    ).toBeGreaterThanOrEqual(0);
    expect(
      result!.metrics.neglectRisk,
    ).toBeLessThanOrEqual(100);
  });

  it("widens health uncertainty for longer horizons", () => {
    const owned =
      new Set(
        demoCollection.map(
          (item) =>
            item.fragranceId,
        ),
      );
    const candidate =
      fragrances.find(
        (fragrance) =>
          !owned.has(
            fragrance.id,
          ),
      )!;

    const short =
      simulatePredictiveAddition({
        fragranceId:
          candidate.id,
        horizonDays: 30,
        collection:
          demoCollection,
        catalog:
          fragrances,
        events: [],
        currentHealth: 82,
      })!;
    const long =
      simulatePredictiveAddition({
        fragranceId:
          candidate.id,
        horizonDays: 365,
        collection:
          demoCollection,
        catalog:
          fragrances,
        events: [],
        currentHealth: 82,
      })!;

    expect(
      long.metrics.projectedHealthHigh -
        long.metrics.projectedHealthLow,
    ).toBeGreaterThanOrEqual(
      short.metrics.projectedHealthHigh -
        short.metrics.projectedHealthLow,
    );
  });
});
