import { describe, expect, it } from "vitest";

import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import {
  analyzeProfileIntelligence,
  defaultProfilePreferences,
} from "@/lib/intelligence/profile-intelligence-engine";

describe("Profile Intelligence", () => {
  const analysis = analyzeCollectionHealth({
    collection: demoCollection,
    profile: demoProfile,
    catalog: fragrances,
  });

  const owned = demoCollection
    .map((item) => {
      const fragrance = fragrances.find(
        (candidate) => candidate.id === item.fragranceId,
      );
      return fragrance
        ? {
            fragrance,
            wearCount: item.wearCount,
            favorite: item.favorite,
            daysSinceLastWear: item.daysSinceLastWear,
          }
        : null;
    })
    .filter(Boolean) as Array<{
      fragrance: (typeof fragrances)[number];
      wearCount: number;
      favorite: boolean;
      daysSinceLastWear: number;
    }>;

  it("creates collector identity, genome, analytics, and milestones", () => {
    const result = analyzeProfileIntelligence({
      owned,
      analysis,
      preferences: defaultProfilePreferences,
      completedCoachActions: 4,
    });

    expect(result.modelVersion).toBe("PI-1.0.0");
    expect(result.tasteGenome).toHaveLength(8);
    expect(result.identityStatement.length).toBeGreaterThan(80);
    expect(result.wearAnalytics.totalWears).toBeGreaterThanOrEqual(0);
    expect(result.milestones).toHaveLength(4);
  });

  it("responds to preference changes", () => {
    const baseline = analyzeProfileIntelligence({
      owned,
      analysis,
      preferences: defaultProfilePreferences,
      completedCoachActions: 0,
    });

    const changed = analyzeProfileIntelligence({
      owned,
      analysis,
      preferences: {
        ...defaultProfilePreferences,
        preferredSeason: "winter",
        preferredRole: "formal",
        minimumLongevity: 95,
      },
      completedCoachActions: 0,
    });

    expect(changed.preferenceAlignment).not.toBe(
      baseline.preferenceAlignment,
    );
  });
});
