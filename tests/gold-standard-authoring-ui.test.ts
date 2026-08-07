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

describe("Gold Standard integrated authoring UI", () => {
  it("contains reviewer switching, autosave, and submit-both workflow", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/gold-standard-builder/dataset-builder.tsx",
        ),
        "utf8",
      );

    expect(
      source,
    ).toContain(
      "Reviewer A",
    );

    expect(
      source,
    ).toContain(
      "Reviewer B",
    );

    expect(
      source,
    ).toContain(
      "Autosaved",
    );

    expect(
      source,
    ).toContain(
      "Submit both for review",
    );
  });
});
