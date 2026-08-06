import { describe, expect, it } from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeFragranceGenome } from "@/lib/intelligence/fragrance-genome-engine";
import { defaultProfilePreferences } from "@/lib/intelligence/profile-intelligence-engine";

describe("Fragrance Genome", () => {
  const ownedIds = new Set(
    demoCollection.map((item) => item.fragranceId),
  );

  const owned = demoCollection
    .map((item) => {
      const fragrance = fragrances.find(
        (candidate) =>
          candidate.id === item.fragranceId,
      );
      return fragrance
        ? {
            fragrance,
            wearCount: item.wearCount,
            favorite: item.favorite,
          }
        : null;
    })
    .filter(Boolean) as Array<{
      fragrance: (typeof fragrances)[number];
      wearCount: number;
      favorite: boolean;
    }>;

  const candidates = fragrances.filter(
    (fragrance) => !ownedIds.has(fragrance.id),
  );

  it("separates owned DNA from worn DNA", () => {
    const result = analyzeFragranceGenome({
      owned,
      candidates,
      preferences: defaultProfilePreferences,
    });

    expect(result.modelVersion).toBe("FG-1.0.0");
    expect(result.dimensions).toHaveLength(8);
    expect(result.signatureCore).toHaveLength(3);
    expect(
      result.dimensions.some(
        (item) => item.owned !== item.worn,
      ),
    ).toBe(true);
  });

  it("produces genome matches and identity direction", () => {
    const result = analyzeFragranceGenome({
      owned,
      candidates,
      preferences: defaultProfilePreferences,
    });

    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.wornIdentity.length).toBeGreaterThan(30);
    expect(result.emergingIdentity.length).toBeGreaterThan(30);
    expect(result.genomeConfidence).toBeGreaterThan(0);
  });
});
