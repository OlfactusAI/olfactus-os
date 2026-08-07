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

describe("Aventus research pack route", () => {
  it("exposes the evidence pack import workspace", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/gold-standard-builder/research/page.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "AventusResearchPack",
    );
  });
});
