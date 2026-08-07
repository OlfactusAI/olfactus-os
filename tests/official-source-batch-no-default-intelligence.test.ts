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

describe("Official Source Batch 001 intelligence integrity", () => {
  it("does not bundle fabricated DNA, roles, seasons, or performance", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/catalog-v2/data/official-source-batch-001.ts",
        ),
        "utf8",
      );

    expect(source).not.toContain("intelligenceProfile:");
    expect(source).not.toContain("performance:");
    expect(source).not.toContain("seasons:");
    expect(source).not.toContain("dna:");
  });
});
