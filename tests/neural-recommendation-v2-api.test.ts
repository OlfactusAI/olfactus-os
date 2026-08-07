import {
  describe,
  expect,
  it,
} from "vitest";
import {
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

describe("Neural Recommendation Engine 2.0 API", () => {
  it("is exposed through the unified intelligence API", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligence-api/index.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "runNeuralRecommendationEngineV2",
    );
    expect(source).toContain(
      "getNeuralRecommendationsV2",
    );
  });
});
