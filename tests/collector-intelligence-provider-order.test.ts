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

describe("Collector Intelligence provider order", () => {
  it("mounts the v4 provider inside PredictiveProvider and before intelligence consumers", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/layout.tsx",
        ),
        "utf8",
      );

    const predictive =
      source.indexOf(
        "<PredictiveProvider>",
      );
    const collector =
      source.indexOf(
        "<CollectorIntelligenceProvider>",
      );
    const everywhere =
      source.indexOf(
        "<IntelligenceEverywhereProvider>",
      );

    expect(
      predictive,
    ).toBeGreaterThan(
      -1,
    );
    expect(
      collector,
    ).toBeGreaterThan(
      predictive,
    );
    expect(
      everywhere,
    ).toBeGreaterThan(
      collector,
    );
    expect(
      source.indexOf(
        "</CollectorIntelligenceProvider>",
      ),
    ).toBeLessThan(
      source.indexOf(
        "</PredictiveProvider>",
      ),
    );
  });
});
