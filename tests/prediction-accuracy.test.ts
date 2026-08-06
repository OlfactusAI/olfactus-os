import { describe, expect, it } from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzePredictionAccuracy } from "@/lib/intelligence/prediction-accuracy-engine";
import type { PurchasePredictionRecord } from "@/lib/predictions/types";

const prediction: PurchasePredictionRecord = {
  id: "prediction-imagination",
  fragranceId: "imagination",
  fragranceName: "Imagination",
  brand: "Louis Vuitton",
  createdAt: "2026-01-01T12:00:00Z",
  purchaseConfirmedAt: "2026-01-02T12:00:00Z",
  originalVerdict: "strong-buy",
  originalConfidence: 95,
  originalBlindBuyRisk: 20,
  predictedHealthGain: 5,
  predictedLongTermValue: 92,
  purchasePrice: 320,
  currency: "USD",
  baselineWearCount: 0,
  baselineCollectionHealth: 86,
  baselineRedundancy: 76,
  maturity: "pending",
};

describe("Purchase Prediction Accuracy", () => {
  it("calculates accuracy from observed ownership outcomes", () => {
    const result = analyzePredictionAccuracy({
      predictions: [prediction],
      collection: demoCollection,
      fragrances,
      currentCollectionHealth: 91,
      currentRedundancy: 81,
    });

    expect(result.modelVersion).toBe("PPA-1.0.0");
    expect(result.outcomes).toHaveLength(1);
    expect(result.overallAccuracy).toBeGreaterThanOrEqual(0);
    expect(result.overallAccuracy).toBeLessThanOrEqual(100);
    expect(
      result.outcomes[0].outcome.wearsSincePurchase,
    ).toBeGreaterThan(0);
  });

  it("creates calibration insights", () => {
    const result = analyzePredictionAccuracy({
      predictions: [prediction],
      collection: demoCollection,
      fragrances,
      currentCollectionHealth: 91,
      currentRedundancy: 81,
    });

    expect(
      result.calibrationInsights.length,
    ).toBeGreaterThan(1);
    expect(
      result.calibrationInsights.join(" "),
    ).toContain("accuracy");
  });
});
