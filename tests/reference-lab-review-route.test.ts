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

describe("Reference Laboratory reviewer route", () => {
  it("exposes evidence review without consensus or certification", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/reference-lab/review/page.tsx",
        ),
        "utf8",
      );

    const workspace =
      readFileSync(
        join(
          process.cwd(),
          "components/reference-lab/review-workspace.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "ReviewWorkspace",
    );

    expect(
      workspace,
    ).toContain(
      "Evidence Ledger + Review",
    );

    expect(
      workspace,
    ).not.toContain(
      "createGoldStandardCertificate",
    );

    expect(
      workspace,
    ).not.toContain(
      "ReferenceConsensusSnapshot",
    );
  });
});
