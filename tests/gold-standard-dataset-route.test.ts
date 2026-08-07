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

describe("Gold Standard Dataset Builder route", () => {
  it("exposes the dataset builder workspace", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/gold-standard-builder/page.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "GoldStandardDatasetBuilder",
    );
  });
});
