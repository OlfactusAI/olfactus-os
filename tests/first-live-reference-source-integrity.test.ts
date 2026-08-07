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

describe("First live reference source integrity", () => {
  it("does not create certificates, consensus, or fingerprints inside the live orchestrator", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/reference-live/orchestrator.ts",
        ),
        "utf8",
      );

    expect(
      source,
    ).not.toContain(
      "createGoldStandardCertificate",
    );

    expect(
      source,
    ).not.toContain(
      "buildReferenceConsensus",
    );

    expect(
      source,
    ).not.toContain(
      "buildProductionFingerprintBundle",
    );
  });
});
