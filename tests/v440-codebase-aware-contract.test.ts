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

describe("NRE 2.0 codebase-aware contracts", () => {
  it("avoids unsupported hard-coded market and DNA members", () => {
    const candidate =
      readFileSync(
        join(
          process.cwd(),
          "lib/recommendation-v2/candidate-generator.ts",
        ),
        "utf8",
      );

    const factors =
      readFileSync(
        join(
          process.cwd(),
          "lib/recommendation-v2/factor-engines.ts",
        ),
        "utf8",
      );

    expect(
      candidate,
    ).not.toContain(
      ".typicalPrice",
    );

    for (const member of [
      ".airy",
      ".warm",
      ".unique",
      ".unusual",
    ]) {
      expect(
        factors,
      ).not.toContain(
        member,
      );
    }

    expect(
      factors,
    ).toContain(
      "readDnaScore",
    );
  });

  it("reuses the existing collector-state and catalog API methods", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligence-api/index.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "this.getCollectorState()",
    );
    expect(source).toContain(
      "this.getCatalogContext()",
    );
    expect(source).not.toContain(
      "getCanonicalCollectorState({",
    );
  });

  it("narrows unified Analyst response and preview safely", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/intelligence/global-olfactus-analyst.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "as AnalystResponse",
    );
    expect(source).toContain(
      '"preview" in result',
    );
  });
});
