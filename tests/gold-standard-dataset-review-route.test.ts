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

describe("Gold Standard Dataset Review route", () => {
  it("exposes the side-by-side Dataset Review Console", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/gold-standard-builder/review/page.tsx",
        ),
        "utf8",
      );

    const workspace =
      readFileSync(
        join(
          process.cwd(),
          "components/gold-standard-builder/dataset-review-console.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "DatasetReviewConsole",
    );

    expect(
      workspace,
    ).toContain(
      "Dataset Review Console",
    );

    expect(
      workspace,
    ).toContain(
      "Request revision",
    );
  });
});
