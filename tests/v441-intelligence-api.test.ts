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

describe("v4.4.1 Intelligence API", () => {
  it("exposes a reusable recommendation explanation endpoint", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligence-api/index.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "getRecommendationExplanationV2",
    );
    expect(source).toContain(
      "buildRecommendationExplanationV2",
    );
  });
});
