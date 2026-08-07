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

describe("Production promotion runtime boundary", () => {
  it("creates activation packages without directly invoking live recommendation engines", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/production-pipeline/pipeline.ts",
        ),
        "utf8",
      );

    expect(
      source,
    ).toContain(
      "createProductionActivationPackage",
    );

    expect(
      source,
    ).not.toContain(
      "recommendFragrances(",
    );

    expect(
      source,
    ).not.toContain(
      "promoteIntelligenceDraft(",
    );
  });
});
