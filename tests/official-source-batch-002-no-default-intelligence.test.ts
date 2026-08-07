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

describe("Official Source Batch 002 intelligence integrity", () => {
  it("contains no fabricated recommendation profile", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/catalog-v2/data/official-source-batch-002.ts",
        ),
        "utf8",
      );

    expect(
      source,
    ).not.toContain(
      "intelligenceProfile:",
    );

    expect(
      source,
    ).not.toContain(
      "dna:",
    );

    expect(
      source,
    ).not.toContain(
      "performance:",
    );
  });
});
