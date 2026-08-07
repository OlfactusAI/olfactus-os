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

describe("Predictive Intelligence Engine", () => {
  it("produces bounded bottle predictions without fabricating evidence", () => {
    const snapshot =
      buildPredictiveSnapshot({
        collection:
          demoCollection,
        catalog:
          fragrances,
        events: [],
      });

    expect(
      snapshot.modelVersion,
    ).toBe(
      "PI-3.0.0-alpha.1",
    );
    expect(
      snapshot.bottlePredictions.length,
    ).toBeGreaterThan(
      0,
    );

    for (
      const prediction
      of snapshot.bottlePredictions
    ) {
      expect(
        prediction.retentionRisk,
      ).toBeGreaterThanOrEqual(
        0,
      );
      expect(
        prediction.retentionRisk,
      ).toBeLessThanOrEqual(
        100,
      );
      expect(
        prediction.signaturePotential,
      ).toBeGreaterThanOrEqual(
        0,
      );
      expect(
        prediction.signaturePotential,
      ).toBeLessThanOrEqual(
        100,
      );
    }

    expect(
      snapshot.confidence,
    ).toBeLessThan(
      60,
    );
  });
});
