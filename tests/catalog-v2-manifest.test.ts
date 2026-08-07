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

describe("Catalog V2 release integration", () => {
  it("registers the catalog expansion release", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/os/system-manifest.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      'version: "4.4.2-alpha.1"',
    );
    expect(source).toContain(
      "Global Fragrance Catalog Expansion Foundation",
    );
  });
});
