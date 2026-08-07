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

describe("Collector Intelligence Provider unified context", () => {
  it("exposes the same API-created intelligence snapshot to UI consumers", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/providers/collector-intelligence-provider.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "UnifiedIntelligenceContext",
    );
    expect(source).toContain(
      "api.getIntelligenceContext()",
    );
    expect(source).toContain(
      "intelligenceContext",
    );
  });
});
