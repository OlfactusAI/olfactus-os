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

describe("Dataset Review Console milestone boundary", () => {
  it("does not generate consensus from the review UI", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/gold-standard-builder/dataset-review-console.tsx",
        ),
        "utf8",
      );

    expect(
      source,
    ).not.toContain(
      "buildReferenceConsensus",
    );

    expect(
      source,
    ).not.toContain(
      "issueReferenceGoldStandardCertification",
    );
  });
});
