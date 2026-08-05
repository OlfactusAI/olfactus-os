import { describe, expect, it } from "vitest";
import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeBuyDecision } from "@/lib/intelligence/buy-decision";

describe("Buy Decision Engine", () => {
  it("identifies Un Air de Bretagne as a low-overlap strategic addition", () => {
    const result = analyzeBuyDecision({ candidateFragranceId: "un-air", collection: demoCollection, profile: demoProfile, catalog: fragrances, price: 190 });
    expect(["buy", "sample"]).toContain(result.verdict);
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.projectedImpact.healthDelta).toBeGreaterThanOrEqual(0);
    expect(result.evidence).toHaveLength(5);
    expect(result.modelVersion).toBe("BDE-1.0.0");
  });

  it("applies greater purchase risk to an expensive candidate", () => {
    const lowerPrice = analyzeBuyDecision({ candidateFragranceId: "un-air", collection: demoCollection, profile: demoProfile, catalog: fragrances, price: 150 });
    const higherPrice = analyzeBuyDecision({ candidateFragranceId: "un-air", collection: demoCollection, profile: demoProfile, catalog: fragrances, price: 650 });
    expect(higherPrice.risk).toBeGreaterThan(lowerPrice.risk);
  });

  it("rejects a candidate that is already owned", () => {
    expect(() => analyzeBuyDecision({ candidateFragranceId: "imagination", collection: demoCollection, profile: demoProfile, catalog: fragrances })).toThrow("already owned");
  });
});
