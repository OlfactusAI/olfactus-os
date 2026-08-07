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

describe("Reference Laboratory route", () => {
  it("exposes the internal calibration workspace without Gold Standard auto-promotion", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/reference-lab/page.tsx",
        ),
        "utf8",
      );

    const workspace =
      readFileSync(
        join(
          process.cwd(),
          "components/reference-lab/calibration-workspace.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "CalibrationWorkspace",
    );

    expect(
      workspace,
    ).toContain(
      "Submit for review",
    );

    expect(
      workspace,
    ).not.toContain(
      "createGoldStandardCertificate",
    );

    expect(
      workspace,
    ).not.toContain(
      "promoteIntelligenceDraft",
    );
  });
});
