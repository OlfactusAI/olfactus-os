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

describe("Production fingerprint route", () => {
  it("exposes fingerprint building without runtime engine activation", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/production-fingerprints/page.tsx",
        ),
        "utf8",
      );

    const workspace =
      readFileSync(
        join(
          process.cwd(),
          "components/production-fingerprints/fingerprint-dashboard.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "FingerprintDashboard",
    );

    expect(
      workspace,
    ).toContain(
      "Build + synchronize fingerprints",
    );

    expect(
      workspace,
    ).not.toContain(
      "recommendFragrances(",
    );

    expect(
      workspace,
    ).not.toContain(
      "promoteIntelligenceDraft(",
    );
  });
});
