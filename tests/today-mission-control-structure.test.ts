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

describe("Today Mission Control structure", () => {
  const source =
    readFileSync(
      join(
        process.cwd(),
        "app/(app)/today/page.tsx",
      ),
      "utf8",
    );

  it("renders one live dashboard", () => {
    const blocks =
      source.match(
        /<LiveMissionControl \/>/g,
      ) ?? [];

    expect(blocks).toHaveLength(
      1,
    );
  });

  it("keeps Live Mission Control inside TodayPage rather than AnalystFact", () => {
    const dashboard =
      source.indexOf(
        "<LiveMissionControl />",
      );
    const pulseBar =
      source.indexOf(
        "function PulseBar",
      );
    const analystFact =
      source.indexOf(
        "function AnalystFact",
      );
    const metricStatus =
      source.indexOf(
        "function getMetricStatus",
      );

    expect(dashboard).toBeGreaterThan(
      0,
    );
    expect(dashboard).toBeLessThan(
      pulseBar,
    );
    expect(
      dashboard >
        analystFact &&
        dashboard <
          metricStatus,
    ).toBe(false);
  });
});
