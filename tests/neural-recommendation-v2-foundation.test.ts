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

describe("Neural Recommendation Engine 2.0", () => {
  it("returns ranked candidates with explainable traces and trade-offs", () => {
    const result =
      runNeuralRecommendationEngineV2({
        catalog:
          bundledIntelligenceCatalog,
        collection: [],
        season:
          "summer",
        temperatureF: 88,
        limit: 5,
      });

    expect(
      result.modelVersion,
    ).toBe(
      "NRE-2.0.0",
    );

    expect(
      result.candidates.length,
    ).toBeGreaterThan(
      0,
    );

    expect(
      result.candidates[0]
        .trace.length,
    ).toBeGreaterThanOrEqual(
      7,
    );

    expect(
      Array.isArray(
        result.candidates[0]
          .tradeoff
          .advantages,
      ),
    ).toBe(true);

    expect(
      result.candidates[0]
        .opportunityCost
        .netGain,
    ).toBeTypeOf(
      "number",
    );
  });
});
