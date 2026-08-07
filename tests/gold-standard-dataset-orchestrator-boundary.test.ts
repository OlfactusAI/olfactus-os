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

describe("Gold Standard Dataset orchestrator runtime boundary", () => {
  it("prepares activation packages without activating runtime references", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/gold-standard-builder/orchestrator.ts",
        ),
        "utf8",
      );

    expect(
      source,
    ).toContain(
      "saveProductionActivationPackage",
    );

    expect(
      source,
    ).not.toContain(
      "activateProductionReference",
    );

    expect(
      source,
    ).not.toContain(
      "saveRuntimeReference",
    );
  });
});
