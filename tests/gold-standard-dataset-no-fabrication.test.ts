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

describe("Gold Standard Dataset Builder no-fabrication guard", () => {
  it("does not seed fragrance scores or consensus values", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/gold-standard-builder/builder.ts",
        ),
        "utf8",
      );

    expect(
      source,
    ).not.toContain(
      "defaultScore",
    );

    expect(
      source,
    ).not.toContain(
      "seedScore",
    );

    expect(
      source,
    ).not.toContain(
      "fakeEvidence",
    );
  });
});
