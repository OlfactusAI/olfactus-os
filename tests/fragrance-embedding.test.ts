import {
  describe,
  expect,
  it,
} from "vitest";

import {
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";
import {
  embedFragrance,
} from "@/lib/embedding/fragrance-embedding";

describe("Fragrance semantic embedding", () => {
  it("produces bounded values across the full semantic preference space", () => {
    const fragrance =
      bundledIntelligenceCatalog[0];
    const embedding =
      embedFragrance(
        fragrance,
      );

    expect(
      Object.keys(
        embedding,
      ).length,
    ).toBe(
      21,
    );

    for (
      const value
      of Object.values(
        embedding,
      )
    ) {
      expect(value).toBeGreaterThanOrEqual(
        0,
      );
      expect(value).toBeLessThanOrEqual(
        100,
      );
    }
  });
});
