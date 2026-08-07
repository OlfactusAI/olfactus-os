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

describe("Aventus research pack authoring integration", () => {
  it("shows shared research beside independent authoring without populating scores", () => {
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
      "Shared research evidence",
    );

    expect(
      source,
    ).toContain(
      "scores remain independent",
    );

    expect(
      source,
    ).not.toContain(
      "applyResearchScores",
    );
  });
});
