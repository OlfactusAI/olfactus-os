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

describe("Today Ahead integration", () => {
  it("mounts the predictive Ahead panel on Today", () => {
    const today =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/today/page.tsx",
        ),
        "utf8",
      );
    const panel =
      readFileSync(
        join(
          process.cwd(),
          "components/intelligence/predictive-ahead.tsx",
        ),
        "utf8",
      );

    expect(today).toContain(
      "<PredictiveAhead />",
    );
    expect(panel).toContain(
      "Your next 90 days",
    );
    expect(panel).toContain(
      "Likely role gap",
    );
  });
});
