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

describe("Production fingerprint no-default policy", () => {
  it("marks missing consensus domains incomplete instead of creating default scores", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/production-fingerprints/builder.ts",
        ),
        "utf8",
      );

    expect(
      source,
    ).toContain(
      '"incomplete"',
    );

    expect(
      source,
    ).toContain(
      "missingDomains",
    );

    expect(
      source,
    ).not.toContain(
      "defaultScore",
    );
  });
});
