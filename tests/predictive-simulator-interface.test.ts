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

describe("Predictive Simulator interface", () => {
  it("exposes future horizons and guarded predictions", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/intelligence/predictive-simulator.tsx",
        ),
        "utf8",
      );

    expect(source).toContain("30 days");
    expect(source).toContain("6 months");
    expect(source).toContain("1 year");
    expect(source).toContain("Signature Potential");
    expect(source).toContain("Neglect Risk");
    expect(source).toContain("Predictive guardrail");
  });
});
