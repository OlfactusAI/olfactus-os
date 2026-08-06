import { describe, expect, it } from "vitest";

import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import { generateDiscoveryIntelligence } from "@/lib/intelligence/discovery-engine";

describe("Discovery Intelligence Engine", () => {
  it("ranks available candidates with explainable output", () => {
    const ownedIds = new Set(
      demoCollection.map((item) => item.fragranceId),
    );
    const owned = fragrances.filter((fragrance) =>
      ownedIds.has(fragrance.id),
    );
    const candidates = fragrances.filter(
      (fragrance) => !ownedIds.has(fragrance.id),
    );
    const analysis = analyzeCollectionHealth({
      collection: demoCollection,
      profile: demoProfile,
      catalog: fragrances,
    });

    const result = generateDiscoveryIntelligence({
      owned,
      candidates,
      analysis,
      desiredSeason: "summer",
      desiredRole: "office",
    });

    expect(result.modelVersion).toBe("DE-1.0.0");
    expect(result.recommendations.length).toBe(candidates.length);
    expect(result.primary?.confidence).toBeGreaterThan(0);
    expect(result.primary?.signals.length).toBeGreaterThanOrEqual(6);
    expect(result.primary?.reasons.length).toBeGreaterThan(0);
  });

  it("returns an empty but valid result when no candidates remain", () => {
    const analysis = analyzeCollectionHealth({
      collection: demoCollection,
      profile: demoProfile,
      catalog: fragrances,
    });

    const result = generateDiscoveryIntelligence({
      owned: fragrances,
      candidates: [],
      analysis,
    });

    expect(result.primary).toBeNull();
    expect(result.recommendations).toEqual([]);
    expect(result.confidence).toBe(0);
  });
});
