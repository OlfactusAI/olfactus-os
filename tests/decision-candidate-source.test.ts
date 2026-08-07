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

describe("Decision Lab candidate source", () => {
  it("derives candidates from the Intelligence API catalog minus canonical ownership", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/decisions/page.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "api.getCatalogContext()",
    );
    expect(source).toContain(
      ".getCollectorState()",
    );
    expect(source).toContain(
      ".ownership.map",
    );
    expect(source).toContain(
      "catalog.filter",
    );
    expect(source).toContain(
      "!ownedIds.has",
    );

    expect(source).not.toContain(
      "const candidates = available",
    );
  });
});
