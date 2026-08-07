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

describe("Predictive scenario store", () => {
  it("stores scenario state without collection mutation APIs", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/predictive/simulator-store.ts",
        ),
        "utf8",
      );

    expect(source).toContain("horizonDays");
    expect(source).not.toContain("dispatch(");
    expect(source).not.toContain("addFragrance(");
  });
});
