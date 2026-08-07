import { describe, expect, it } from "vitest";
import { buildCollectionHealthExplanation } from "@/lib/intelligence-everywhere/explain-score";

describe("Explain Every Score", () => {
  it("returns strengths, friction, confidence, and evidence", () => {
    const result = buildCollectionHealthExplanation({
      healthScore: 87,
      roleCoverage: 92,
      seasonalBalance: 84,
      dnaDiversity: 86,
      redundancy: 48,
      rotationBalance: 73,
    });

    expect(result.score).toBe(87);
    expect(result.confidence).toBeGreaterThanOrEqual(80);
    expect(result.positives.length).toBeGreaterThan(0);
    expect(result.negatives.length).toBeGreaterThan(0);
    expect(result.evidence.length).toBe(5);
  });
});
