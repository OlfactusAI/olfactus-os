import {
  describe,
  expect,
  it,
} from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import {
  analyzeBrandIntelligence,
  compareBrands,
  searchAndSortBrands,
} from "@/lib/intelligence/brand-intelligence-engine";

describe("Brand Intelligence", () => {
  const database =
    buildGlobalFragranceDatabase({
      catalog: fragrances,
    });

  const result =
    analyzeBrandIntelligence({
      database,
      collection: demoCollection,
    });

  it("aggregates normalized fragrance portfolios into brands", () => {
    expect(result.modelVersion).toBe(
      "BIO-1.0.0",
    );
    expect(
      result.brands.length,
    ).toBe(database.brands.length);
    expect(
      result.brands.every(
        (brand) =>
          brand.fragranceCount > 0,
      ),
    ).toBe(true);
  });

  it("calculates complete Brand DNA and performance metrics", () => {
    const brand =
      result.brands[0];

    expect(
      Object.keys(brand.dna),
    ).toHaveLength(8);
    expect(
      brand.averageLongevity,
    ).toBeGreaterThanOrEqual(0);
    expect(
      brand.averageProjection,
    ).toBeGreaterThanOrEqual(0);
    expect(
      brand.versatilityScore,
    ).toBeGreaterThanOrEqual(0);
  });

  it("calculates personalized coverage and next-purchase intelligence", () => {
    const ownedBrand =
      result.brands.find(
        (brand) =>
          brand.collectionOwnedCount >
          0,
      );

    expect(ownedBrand).toBeDefined();
    expect(
      ownedBrand!.collectionCoverage,
    ).toBeGreaterThan(0);
  });

  it("generates comparable brand metrics", () => {
    const comparison =
      compareBrands(
        result.brands.slice(0, 3),
      );

    expect(
      comparison.length,
    ).toBeGreaterThan(5);
    expect(
      Object.keys(
        comparison[0].values,
      ).length,
    ).toBeLessThanOrEqual(3);
  });

  it("searches and sorts brand intelligence profiles", () => {
    const target =
      result.brands[0];

    const searched =
      searchAndSortBrands({
        brands: result.brands,
        query: target.name,
        sort: "name",
      });

    expect(
      searched[0].brandId,
    ).toBe(target.brandId);

    const sorted =
      searchAndSortBrands({
        brands: result.brands,
        query: "",
        sort: "quality",
      });

    for (
      let index = 1;
      index < sorted.length;
      index += 1
    ) {
      expect(
        sorted[index - 1]
          .averageDataQuality,
      ).toBeGreaterThanOrEqual(
        sorted[index]
          .averageDataQuality,
      );
    }
  });
});
