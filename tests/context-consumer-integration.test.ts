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

describe("Unified Intelligence Context consumers", () => {
  it("routes NRE 2, Analyst, semantic reasoning, and Decision Core through the shared context", () => {
    const api =
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligence-api/index.ts",
        ),
        "utf8",
      );
    const analyst =
      readFileSync(
        join(
          process.cwd(),
          "lib/analyst/unified-engine.ts",
        ),
        "utf8",
      );
    const semantic =
      readFileSync(
        join(
          process.cwd(),
          "lib/semantic/engine.ts",
        ),
        "utf8",
      );
    const decision =
      readFileSync(
        join(
          process.cwd(),
          "lib/decision-core/engine.ts",
        ),
        "utf8",
      );

    expect(api).toContain(
      "this.getIntelligenceContext()",
    );
    expect(analyst).toContain(
      "api.getIntelligenceContext()",
    );
    expect(semantic).toContain(
      "api.getIntelligenceContext()",
    );
    expect(decision).toContain(
      "api.getIntelligenceContext()",
    );
  });
});
