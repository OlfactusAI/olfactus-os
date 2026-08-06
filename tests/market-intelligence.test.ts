import { describe, expect, it } from "vitest";

import {
  analyzeMarketIntelligence,
  formatDealQuality,
  summarizeCollectionMarketValue,
} from "@/lib/intelligence/market-intelligence-engine";

describe("Market Intelligence Engine", () => {
  it("calculates fair value, buy window, and cost per wear", () => {
    const result =
      analyzeMarketIntelligence({
        observedPrice: 225,
        retailPrice: 320,
        typicalMarketPrice: 245,
        valueScore: 86,
        availability:
          "widely-available",
        strategicValue: 91,
        overlap: 24,
        blindBuyRisk: 28,
        expectedAnnualWears: 30,
      });

    expect(result.modelVersion).toBe(
      "MIE-1.0.0",
    );
    expect(result.fairValueScore).toBeGreaterThanOrEqual(0);
    expect(result.fairValueScore).toBeLessThanOrEqual(100);
    expect(
      result.recommendedBuyWindow.minimum,
    ).toBeLessThanOrEqual(
      result.recommendedBuyWindow.maximum,
    );
    expect(
      result.projectedCostPerWear,
    ).toBeGreaterThan(0);
    expect(result.explanation.length).toBeGreaterThan(100);
  });

  it("penalizes an overpriced high-risk purchase", () => {
    const safe =
      analyzeMarketIntelligence({
        observedPrice: 180,
        typicalMarketPrice: 220,
        valueScore: 85,
        strategicValue: 90,
        overlap: 18,
        blindBuyRisk: 22,
      });

    const risky =
      analyzeMarketIntelligence({
        observedPrice: 520,
        typicalMarketPrice: 220,
        valueScore: 55,
        strategicValue: 42,
        overlap: 78,
        blindBuyRisk: 82,
      });

    expect(risky.marketRisk).toBeGreaterThan(
      safe.marketRisk,
    );
    expect(risky.fairValueScore).toBeLessThan(
      safe.fairValueScore,
    );
  });

  it("summarizes collection value", () => {
    const summary =
      summarizeCollectionMarketValue([
        {
          fragranceId: "one",
          retailPrice: 300,
          typicalMarketPrice: 250,
          purchasePrice: 210,
          wearCount: 20,
          valueScore: 90,
        },
        {
          fragranceId: "two",
          retailPrice: 200,
          typicalMarketPrice: 180,
          purchasePrice: 170,
          wearCount: 10,
          valueScore: 60,
        },
      ]);

    expect(summary.retailValue).toBe(500);
    expect(
      summary.estimatedMarketValue,
    ).toBe(430);
    expect(summary.totalAmountPaid).toBe(380);
    expect(
      summary.averageCostPerWear,
    ).toBeGreaterThan(0);
  });

  it("formats deal verdicts", () => {
    expect(
      formatDealQuality(
        "exceptional-deal",
      ),
    ).toBe("Exceptional Deal");
    expect(
      formatDealQuality(
        "wait-for-sale",
      ),
    ).toBe("Wait for Sale");
  });
});
