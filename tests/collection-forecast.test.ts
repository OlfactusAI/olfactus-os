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
  forecastCollection,
} from "@/lib/prediction/collection-forecast";

describe("Future Collection Health Engine", () => {
  it("builds all required forecast horizons with widening uncertainty", () => {
    const forecast =
      forecastCollection({
        collection:
          demoCollection,
        catalog:
          fragrances,
        profile:
          demoProfile,
        events: [],
      });

    expect(
      forecast.points.map(
        (point) =>
          point.horizon,
      ),
    ).toEqual([
      "now",
      "30d",
      "90d",
      "6m",
      "1y",
    ]);

    const thirty =
      forecast.points.find(
        (point) =>
          point.horizon ===
          "30d",
      )!;
    const annual =
      forecast.points.find(
        (point) =>
          point.horizon ===
          "1y",
      )!;

    expect(
      annual.health.high -
        annual.health.low,
    ).toBeGreaterThanOrEqual(
      thirty.health.high -
        thirty.health.low,
    );
    expect(
      annual.confidence,
    ).toBeLessThanOrEqual(
      thirty.confidence,
    );
  });

  it("keeps every forecast score bounded", () => {
    const forecast =
      forecastCollection({
        collection:
          demoCollection,
        catalog:
          fragrances,
        profile:
          demoProfile,
        events: [],
      });

    for (
      const point
      of forecast.points
    ) {
      expect(
        point.health.center,
      ).toBeGreaterThanOrEqual(
        0,
      );
      expect(
        point.health.center,
      ).toBeLessThanOrEqual(
        100,
      );
      expect(
        point.health.low,
      ).toBeLessThanOrEqual(
        point.health.high,
      );
    }
  });
});
