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

describe("Production Activation Bridge source integrity", () => {
  it("does not rewrite calibration or consensus source objects", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/production-activation/bridge.ts",
        ),
        "utf8",
      );

    expect(
      source,
    ).not.toContain(
      "saveReferenceWorkspaceDraft",
    );

    expect(
      source,
    ).not.toContain(
      "saveReferenceConsensusRuns",
    );

    expect(
      source,
    ).not.toContain(
      "createGoldStandardCertificate",
    );
  });
});
