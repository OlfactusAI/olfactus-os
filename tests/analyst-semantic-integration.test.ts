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

describe("Analyst semantic integration", () => {
  it("routes descriptive fragrance requests through semantic intelligence", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/analyst/unified-engine.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "runSemanticFragranceQuery",
    );
    expect(source).toContain(
      "looksLikeSemanticFragranceRequest",
    );
    expect(source).toContain(
      "Personal Fragrance Language",
    );
  });
});
