import { describe, expect, it } from "vitest";

import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import { analyzeDecisionLab } from "@/lib/intelligence/decision-lab-engine";
import {
  analyzeBlindBuyRisk,
  formatRiskTier,
} from "@/lib/intelligence/blind-buy-risk-engine";
import { defaultProfilePreferences } from "@/lib/intelligence/profile-intelligence-engine";

describe("Blind Buy Risk Intelligence", () => {
  const analysis = analyzeCollectionHealth({
    collection: demoCollection,
    profile: demoProfile,
    catalog: fragrances,
  });

  const ownedIds = new Set(
    demoCollection.map((item) => item.fragranceId),
  );
  const owned = fragrances.filter((fragrance) =>
    ownedIds.has(fragrance.id),
  );
  const candidate = fragrances.find(
    (fragrance) => !ownedIds.has(fragrance.id),
  )!;

  it("returns personalized risk, verdict, reasons, and similarities", () => {
    const decision = analyzeDecisionLab({
      candidate,
      owned,
      analysis,
    });

    const result = analyzeBlindBuyRisk({
      candidate,
      owned,
      preferences: defaultProfilePreferences,
      decision,
    });

    expect(result.modelVersion).toBe("BRI-1.0.0");
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(result.reasonsLoweringRisk.length).toBeGreaterThan(0);
    expect(result.reasonsRaisingRisk.length).toBeGreaterThan(0);
    expect(result.similarOwned.length).toBeGreaterThan(0);
    expect(result.summary.length).toBeGreaterThan(100);
  });

  it("raises risk when price greatly exceeds budget", () => {
    const decision = analyzeDecisionLab({
      candidate,
      owned,
      analysis,
      price: 900,
    });

    const normal = analyzeBlindBuyRisk({
      candidate,
      owned,
      preferences: defaultProfilePreferences,
      decision,
      observedPrice: 180,
    });

    const expensive = analyzeBlindBuyRisk({
      candidate,
      owned,
      preferences: {
        ...defaultProfilePreferences,
        budgetCeiling: 150,
      },
      decision,
      observedPrice: 900,
    });

    expect(expensive.riskScore).toBeGreaterThan(normal.riskScore);
  });

  it("formats risk tiers", () => {
    expect(formatRiskTier("very-low")).toBe("Very Low Risk");
    expect(formatRiskTier("very-high")).toBe("Very High Risk");
  });
});
