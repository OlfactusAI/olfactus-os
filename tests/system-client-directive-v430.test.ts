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

describe("System client directive", () => {
  it("keeps use client as the first executable statement", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/system/page.tsx",
        ),
        "utf8",
      );

    const firstNonEmptyLine =
      source
        .split(
          "\n",
        )
        .find(
          (line) =>
            line.trim()
              .length >
            0,
        )
        ?.trim();

    expect(
      firstNonEmptyLine,
    ).toBe(
      '"use client";',
    );
  });
});
