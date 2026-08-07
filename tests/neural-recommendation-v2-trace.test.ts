import {
  describe,
  expect,
  it,
} from "vitest";

import {
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";
import {
  runNeuralRecommendationEngineV2,
} from "@/lib/recommendation-v2/engine";

describe("Recommendation Trace", () => {
  it("contains positive and negative reasoning contributions", () => {
    const result =
      runNeuralRecommendationEngineV2({
        catalog:
          bundledIntelligenceCatalog,
        collection: [],
        season:
          "winter",
        temperatureF: 45,
        limit: 8,
      });

    const contributions =
      result.candidates.flatMap(
        (candidate) =>
          candidate.trace.map(
            (step) =>
              step.contribution,
          ),
      );

    expect(
      contributions.some(
        (value) =>
          value >
          0,
      ),
    ).toBe(true);

    expect(
      contributions.some(
        (value) =>
          value <
          0,
      ),
    ).toBe(true);
  });
});
