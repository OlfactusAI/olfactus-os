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

describe("Catalog v4.4.2 alpha.2 release integration", () => {
  it("registers source adapters, staging, and activation", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/os/system-manifest.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      'version: "4.4.2-alpha.2"',
    );
    expect(source).toContain(
      "Catalog Source Adapters",
    );
    expect(source).toContain(
      "Catalog Activation Gateway",
    );
  });
});
