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

describe("Reference Laboratory certification route", () => {
  it("exposes Gold Standard certification while keeping production activation separate", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/reference-lab/certification/page.tsx",
        ),
        "utf8",
      );

    const workspace =
      readFileSync(
        join(
          process.cwd(),
          "components/reference-lab/certification-workspace.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "CertificationWorkspace",
    );

    expect(
      workspace,
    ).toContain(
      "Issue Gold Standard Certificate",
    );

    expect(
      workspace,
    ).toContain(
      "production-promotion queue",
    );

    expect(
      workspace,
    ).not.toContain(
      "promoteIntelligenceDraft",
    );
  });
});
