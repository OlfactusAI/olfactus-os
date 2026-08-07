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

describe("Workspace navigation icon imports", () => {
  it("imports every icon referenced by the entity comparison workspace", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "lib/navigation/workspaces.ts",
      ),
      "utf8",
    );

    expect(source).toContain(
      "GitCompareArrows",
    );
    expect(source).toMatch(
      /import\s*\{[\s\S]*GitCompareArrows[\s\S]*\}\s*from\s*"lucide-react";/,
    );
  });
});
