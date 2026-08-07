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

describe("No demo intelligence on Today", () => {
  it("uses the live mission-control component instead of fixed examples", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/today/page.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "<LiveMissionControl />",
    );
    expect(source).not.toContain(
      'healthScore: 91',
    );
    expect(source).not.toContain(
      'recommendation: "Imagination"',
    );
    expect(source).not.toContain(
      'value: "Reflection Man"',
    );
  });
});
