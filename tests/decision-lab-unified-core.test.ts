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

describe("Decision Lab Unified Decision Core integration", () => {
  it("renders the unified decision and provenance alongside existing deep analysis", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/decisions/page.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "evaluateCandidateDecision",
    );
    expect(source).toContain(
      "Unified Decision Core · UDC-1.0.0",
    );
    expect(source).toContain(
      "Provenance:",
    );
    expect(source).toContain(
      ".provenance",
    );
    expect(source).toContain(
      ".evidence",
    );
  });
});
