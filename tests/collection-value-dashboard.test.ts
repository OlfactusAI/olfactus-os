import { describe, expect, it } from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionValueDashboard } from "@/lib/intelligence/collection-value-dashboard";

describe("Collection Value Dashboard", () => {
  const result =
    analyzeCollectionValueDashboard({
      collection: demoCollection,
      catalog: fragrances,
    });

  it("produces a complete portfolio summary", () => {
    expect(result.modelVersion).toBe("CVD-1.0.0");
    expect(result.estimatedMarketValue).toBeGreaterThan(0);
    expect(result.retailReplacementValue).toBeGreaterThan(0);
    expect(result.holdings.length).toBe(demoCollection.length);
    expect(result.marketHealth).toBeGreaterThanOrEqual(0);
    expect(result.marketHealth).toBeLessThanOrEqual(100);
  });

  it("calculates allocations that sum close to 100 percent", () => {
    const total = result.byBrand.reduce(
      (sum, entry) =>
        sum + entry.percentage,
      0,
    );

    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it("ranks holdings and generates analyst reasoning", () => {
    expect(result.topHoldings.length).toBeGreaterThan(0);
    expect(result.bestPurchases.length).toBeGreaterThan(0);
    expect(result.needsAttention.length).toBeGreaterThan(0);
    expect(result.analystBriefing.length).toBeGreaterThan(120);
  });
});
