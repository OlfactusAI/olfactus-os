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

describe("v4.1 Intelligence API migration", () => {
  it("migrates Analyst, Today, and Simulator reads to Collector Intelligence", () => {
    const analyst =
      readFileSync(
        join(
          process.cwd(),
          "components/intelligence/global-olfactus-analyst.tsx",
        ),
        "utf8",
      );
    const today =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/today/page.tsx",
        ),
        "utf8",
      );
    const simulator =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/simulator/page.tsx",
        ),
        "utf8",
      );

    expect(analyst).toContain(
      "useCollectorIntelligence",
    );
    expect(analyst).toContain(
      "runUnifiedAnalystCommand",
    );
    expect(today).toContain(
      "runUnifiedWeatherAwareNeuralCore",
    );
    expect(today).toContain(
      "useCollectorIntelligence",
    );
    expect(simulator).toContain(
      "collectorState.collection",
    );
    expect(simulator).toContain(
      "api.getCatalogContext()",
    );
  });
});
