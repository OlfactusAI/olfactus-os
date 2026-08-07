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

describe("Production fingerprint consensus binding", () => {
  it("requires the exact consensus snapshot named by the certificate", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/production-fingerprints/builder.ts",
        ),
        "utf8",
      );

    expect(
      source,
    ).toContain(
      "record.certificate",
    );

    expect(
      source,
    ).toContain(
      ".consensusId",
    );

    expect(
      source,
    ).toContain(
      "run.snapshot",
    );
  });
});
