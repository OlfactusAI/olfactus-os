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

describe("First live reference no-fabrication policy", () => {
  it("requires existing certified pipeline artifacts instead of seeding synthetic scores", () => {
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
    ).toContain(
      "loadReferenceConsensusRuns",
    );

    expect(
      source,
    ).toContain(
      "loadReferenceGoldStandardCertificates",
    );

    expect(
      source,
    ).toContain(
      "loadProductionFingerprintBundles",
    );

    expect(
      source,
    ).not.toContain(
      "defaultScore",
    );

    expect(
      source,
    ).not.toContain(
      "seedConsensus",
    );
  });
});
