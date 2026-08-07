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

describe("Predictive Future Timeline interface", () => {
  it("renders forecast horizons, bottle states, roles, DNA, and milestones", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/predictions/page.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "Future Collection Timeline",
    );
    expect(source).toContain(
      "Bottle Future States",
    );
    expect(source).toContain(
      "Future Role Coverage",
    );
    expect(source).toContain(
      "DNA Forecast",
    );
    expect(source).toContain(
      "selectedHorizon",
    );
  });
});
