import { describe, expect, it } from "vitest";
import { buildIntelligenceOverlay } from "@/lib/intelligence-everywhere/overlay";

describe("Live Intelligence Overlay", () => {
  it("classifies today's recommendation from the wear score", () => {
    const result = buildIntelligenceOverlay({
      entityId: "fragrance:imagination",
      confidence: 92,
      overlap: 38,
      wearScoreToday: 95,
      collectionRank: 4,
      lastWornDays: 18,
      valueTrend: "rising",
    });

    expect(result.recommendation).toBe("excellent");
    expect(result.collectionRank).toBe(4);
  });
});
