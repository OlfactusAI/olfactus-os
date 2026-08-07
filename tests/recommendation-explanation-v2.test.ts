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
import {
  buildRecommendationExplanationV2,
} from "@/lib/recommendation-v2/explanation-view-model";

describe("Explainable Recommendation Experience", () => {
  it("combines trace, trade-offs, opportunity cost, and collection impact", () => {
    const run =
      runNeuralRecommendationEngineV2({
        catalog:
          bundledIntelligenceCatalog,
        collection: [],
        season:
          "summer",
        temperatureF: 88,
        limit: 3,
      });

    const candidate =
      run.candidates[0];

    expect(candidate).toBeTruthy();

    const explanation =
      buildRecommendationExplanationV2({
        candidate,
        collection: [],
        catalog:
          bundledIntelligenceCatalog,
      });

    expect(
      explanation.trace.length,
    ).toBeGreaterThan(
      0,
    );
    expect(
      explanation.tradeoff,
    ).toBeTruthy();
    expect(
      explanation.opportunityCost,
    ).toBeTruthy();
    expect(
      explanation.collectionImpact,
    ).toBeTruthy();
  });
});
