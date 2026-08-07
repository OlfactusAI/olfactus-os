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

describe("Current CollectorProfile fixture", () => {
  it("uses only the current profile properties", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "tests/intelligence-readiness-integration-repair.test.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "collectionStrategy:",
    );
    expect(source).toContain(
      "targetSize:",
    );
    expect(source).toContain(
      "climate:",
    );

    for (const removed of [
      "displayName:",
      "goals:",
      "preferredFamilies:",
      "dislikedFamilies:",
      "preferredRoles:",
      "budgetTier:",
      "riskTolerance:",
    ]) {
      expect(
        source,
      ).not.toContain(
        removed,
      );
    }
  });
});
