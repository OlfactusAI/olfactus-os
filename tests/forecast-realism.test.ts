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

describe("Collection forecast realism", () => {
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

  it("does not use near-unbounded uncertainty ranges", () => {
    for (
      const point
      of forecast.points
    ) {
      if (
        point.horizon ===
        "now"
      ) {
        continue;
      }

      expect(
        point.health.high -
          point.health.low,
      ).toBeLessThanOrEqual(
        28,
      );
    }
  });

  it("allows future active rotation and neglect to evolve", () => {
    const now =
      forecast.points.find(
        (point) =>
          point.horizon ===
          "now",
      )!;
    const annual =
      forecast.points.find(
        (point) =>
          point.horizon ===
          "1y",
      )!;

    expect(
      annual.activeRotation,
    ).toBeLessThanOrEqual(
      now.activeRotation,
    );
    expect(
      annual.neglectedCount,
    ).toBeGreaterThanOrEqual(
      now.neglectedCount,
    );
  });

  it("does not freeze every future metric across all horizons", () => {
    const future =
      forecast.points.filter(
        (point) =>
          point.horizon !==
          "now",
      );

    const health =
      new Set(
        future.map(
          (point) =>
            point.health.center,
        ),
      );
    const rotation =
      new Set(
        future.map(
          (point) =>
            point.activeRotation,
        ),
      );
    const signature =
      new Set(
        future.map(
          (point) =>
            point.signatureStability,
        ),
      );

    expect(
      health.size +
        rotation.size +
        signature.size,
    ).toBeGreaterThan(
      3,
    );
  });
});
