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

describe("Intelligence API Unified Registry integration", () => {
  it("uses one registry for collector, catalog, personal graph, and global graph context", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligence-api/index.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "createUnifiedRegistry",
    );
    expect(source).toContain(
      "getRegistry()",
    );
    expect(source).toContain(
      "registry.catalog.byId",
    );
    expect(source).toContain(
      "registry.graph.global",
    );
  });
});
