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

describe("v4.4.6-alpha.3 domain type alignment", () => {
  it("does not depend on a nonexistent Mood domain export", () => {
    const intelligence =
      readFileSync(
        join(
          process.cwd(),
          "lib/catalog-v2/enrichment/intelligence-types.ts",
        ),
        "utf8",
      );

    const reference =
      readFileSync(
        join(
          process.cwd(),
          "lib/reference-lab/types.ts",
        ),
        "utf8",
      );

    expect(
      intelligence,
    ).not.toContain(
      "Mood,",
    );

    expect(
      reference,
    ).not.toContain(
      "Mood,",
    );
  });

  it("uses the current eight OLFACTUS DNA dimensions for promotion", () => {
    const gate =
      readFileSync(
        join(
          process.cwd(),
          "lib/catalog-v2/enrichment/promotion-gate.ts",
        ),
        "utf8",
      );

    for (
      const dimension
      of [
        "fresh",
        "green",
        "woody",
        "amber",
        "sweet",
        "dark",
        "artistic",
        "formal",
      ]
    ) {
      expect(
        gate,
      ).toContain(
        `"${dimension}"`,
      );
    }
  });
});
