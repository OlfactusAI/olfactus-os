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

describe("Active Catalog global seed integration", () => {
  it("uses bundledIntelligenceCatalog instead of the 8-item core fixture", () => {
    const provider =
      readFileSync(
        join(
          process.cwd(),
          "components/providers/active-catalog-provider.tsx",
        ),
        "utf8",
      );

    expect(provider).toContain(
      "bundledIntelligenceCatalog as bundledFragrances",
    );
    expect(provider).not.toContain(
      'fragrances as bundledFragrances } from "@/lib/data/fragrances"',
    );
  });
});
