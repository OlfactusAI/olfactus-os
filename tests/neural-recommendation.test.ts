import { describe, expect, it } from "vitest";

import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import { generateDiscoveryIntelligence } from "@/lib/intelligence/discovery-engine";

describe("Neural Recommendation System", () => {
  it("produces analyst narrative, simulation dimensions, and pipeline stages", () => {
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

    expect(result.primary?.analystNarrative.length).toBeGreaterThan(80);
    expect(result.primary?.impactDimensions).toHaveLength(5);
    expect(result.pipeline).toHaveLength(6);
    expect(result.pipeline.every((stage) => stage.status === "complete")).toBe(true);
  });
});
