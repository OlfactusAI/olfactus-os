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

describe("Decision Lab empty states", () => {
  it("does not equate an empty candidate list with total catalog ownership", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/decisions/page.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "Intelligence catalog unavailable.",
    );
    expect(source).toContain(
      "Every catalog fragrance is already owned.",
    );
    expect(source).toContain(
      "No eligible decision candidate is available.",
    );
    expect(source).toContain(
      "Decision analysis unavailable.",
    );
    expect(source).toContain(
      "ownsEntireCatalog",
    );
  });
});
