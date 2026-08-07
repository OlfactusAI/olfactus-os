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

describe("Reference Laboratory submission integration", () => {
  it("persists a review package when the calibration workspace submits", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/reference-lab/calibration-workspace.tsx",
        ),
        "utf8",
      );

    expect(
      source,
    ).toContain(
      "createReviewPackageFromWorkspace",
    );

    expect(
      source,
    ).toContain(
      "upsertReferenceReviewPackage",
    );
  });
});
