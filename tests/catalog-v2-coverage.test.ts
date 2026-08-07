import {
  describe,
  expect,
  it,
} from "vitest";
import {
  calculateCatalogCoverage,
} from "@/lib/catalog-v2/coverage";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

function record(
  brand: string,
  name: string,
): CatalogV2Record {
  return {
    canonicalId:
      `${brand}:${name}`,
    brand,
    name,
    aliases: [],
    perfumers: [],
    notes: [],
    accords: [],
    collections: [],
    validationStatus:
      "validated",
    provenance: [],
    fieldConfidence: {},
  };
}

describe("Catalog V2 house coverage", () => {
  it("measures designer, niche, and heritage target coverage", () => {
    const coverage =
      calculateCatalogCoverage([
        record(
          "Dior",
          "Sauvage",
        ),
        record(
          "Creed",
          "Aventus",
        ),
        record(
          "Guerlain",
          "Habit Rouge",
        ),
      ]);

    expect(
      coverage.tiers.length,
    ).toBe(
      3,
    );

    expect(
      coverage.tiers.every(
        (tier) =>
          tier.coveragePercent >=
            0 &&
          tier.coveragePercent <=
            100,
      ),
    ).toBe(true);
  });
});
