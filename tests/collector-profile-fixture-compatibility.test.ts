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

describe("Collector profile fixture compatibility", () => {
  it("does not use removed profile properties", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "tests/intelligence-readiness-integration-repair.test.ts",
      ),
      "utf8",
    );

    expect(source).not.toContain(
      "displayName:",
    );
    expect(source).not.toContain(
      "goals:",
    );
    expect(source).not.toContain(
      "preferredFamilies:",
    );
  });
});
