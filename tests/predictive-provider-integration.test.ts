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

describe("Predictive provider integration", () => {
  it("wraps the app and exposes a Predictions workspace", () => {
    const layout =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/layout.tsx",
        ),
        "utf8",
      );
    const workspaces =
      readFileSync(
        join(
          process.cwd(),
          "lib/navigation/workspaces.ts",
        ),
        "utf8",
      );

    expect(layout).toContain(
      "<PredictiveProvider>",
    );
    expect(workspaces).toContain(
      'href: "/predictions"',
    );
  });
});
