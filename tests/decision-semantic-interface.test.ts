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

describe("Decision Lab semantic interface", () => {
  it("lets natural language constrain the candidate universe", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/decisions/page.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "Personal Fragrance Language · PFL-1.0.0",
    );
    expect(source).toContain(
      "semanticQuery",
    );
    expect(source).toContain(
      "runSemanticFragranceQuery",
    );
    expect(source).toContain(
      "decisionCandidates",
    );
  });
});
