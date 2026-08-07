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

describe("Reference Laboratory consensus route", () => {
  it("exposes consensus and conflict detection without certification or NRE promotion", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/reference-lab/consensus/page.tsx",
        ),
        "utf8",
      );

    const workspace =
      readFileSync(
        join(
          process.cwd(),
          "components/reference-lab/consensus-workspace.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "ConsensusWorkspace",
    );

    expect(
      workspace,
    ).toContain(
      "Consensus + Conflict Detection",
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
