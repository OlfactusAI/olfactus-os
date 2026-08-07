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

describe("Catalog intelligence promotion integrity", () => {
  it("requires explicit approval and evidence before profile conversion", () => {
    const gate =
      readFileSync(
        join(
          process.cwd(),
          "lib/catalog-v2/enrichment/promotion-gate.ts",
        ),
        "utf8",
      );

    const promote =
      readFileSync(
        join(
          process.cwd(),
          "lib/catalog-v2/enrichment/promote.ts",
        ),
        "utf8",
      );

    expect(
      gate,
    ).toContain(
      'draft.status !==',
    );

    expect(
      gate,
    ).toContain(
      '"approved"',
    );

    expect(
      promote,
    ).toContain(
      "if (",
    );

    expect(
      promote,
    ).toContain(
      "!decision.eligible",
    );
  });
});
