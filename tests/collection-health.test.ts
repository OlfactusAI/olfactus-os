import { describe, expect, it } from "vitest";
import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";

describe("Collection Health Engine", () => {
  it("returns a stable explainable analysis for the calibration collection", () => {
    const result=analyzeCollectionHealth({collection:demoCollection,profile:demoProfile,catalog:fragrances});
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.score).toBeLessThanOrEqual(95);
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.modelVersion).toBe("CHE-1.0.0");
  });
  it("penalizes a collection with no bottles", () => {
    const result=analyzeCollectionHealth({collection:[],profile:demoProfile,catalog:fragrances});
    expect(result.score).toBeLessThan(40);
  });
});
