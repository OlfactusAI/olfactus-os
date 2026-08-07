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

describe("v4.4.2 Analyst preview safety", () => {
  it("does not directly dereference an optional unified preview", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/intelligence/global-olfactus-analyst.tsx",
        ),
        "utf8",
      );

    expect(
      source,
    ).not.toMatch(
      /\("preview" in result \? result\.preview : undefined\)\.(?!\?)/,
    );
  });
});
