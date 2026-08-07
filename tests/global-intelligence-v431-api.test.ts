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

describe("v4.3.1 Global Intelligence API", () => {
  it("exposes relationship coverage and recommendation context", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligence-api/index.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "getGlobalRelationshipCoverage()",
    );
    expect(source).toContain(
      "getGraphRecommendationContext",
    );
  });
});
