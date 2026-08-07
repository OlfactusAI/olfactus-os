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

describe("Unified Intelligence API context integration", () => {
  it("creates and exposes one Unified Intelligence Context", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligence-api/index.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "createUnifiedIntelligenceContext",
    );
    expect(source).toContain(
      "getIntelligenceContext()",
    );
    expect(source).toContain(
      "intelligenceContext.collector",
    );
    expect(source).toContain(
      "intelligenceContext.catalog",
    );
  });
});
