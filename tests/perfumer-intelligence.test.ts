import {
  describe,
  expect,
  it,
} from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import {
  analyzePerfumerIntelligence,
  comparePerfumers,
  searchAndSortPerfumers,
} from "@/lib/intelligence/perfumer-intelligence-engine";

describe("Perfumer Intelligence", () => {
  const database =
    buildGlobalFragranceDatabase({
      catalog: fragrances,
    });

  const result =
    analyzePerfumerIntelligence({
      database,
      collection: demoCollection,
    });

  it("creates profiles only from curated attributions", () => {
    expect(result.modelVersion).toBe(
      "PIO-1.0.0",
    );
    expect(
      result.profiles.length,
    ).toBeGreaterThan(4);
    expect(
      result.undisclosedFragranceIds,
    ).toContain("naxos");
  });

  it("calculates creator DNA and portfolio metrics", () => {
    const profile =
      result.profiles[0];

    expect(
      Object.keys(profile.dna),
    ).toHaveLength(8);
    expect(
      profile.fragranceCount,
    ).toBeGreaterThan(0);
    expect(
      profile.averageLongevity,
    ).toBeGreaterThanOrEqual(0);
    expect(
      profile.influenceScore,
    ).toBeGreaterThanOrEqual(0);
  });

  it("preserves attribution integrity for each credit", () => {
    expect(
      result.profiles.every(
        (profile) =>
          profile.credits.every(
            (credit) =>
              credit.attributionConfidence >=
              90,
          ),
      ),
    ).toBe(true);
  });

  it("searches and sorts perfumer profiles", () => {
    const target =
      result.profiles[0];

    const searched =
      searchAndSortPerfumers({
        profiles: result.profiles,
        query: target.name,
        sort: "name",
      });

    expect(
      searched[0].perfumerId,
    ).toBe(target.perfumerId);

    const sorted =
      searchAndSortPerfumers({
        profiles: result.profiles,
        query: "",
        sort: "influence",
      });

    for (
      let index = 1;
      index < sorted.length;
      index += 1
    ) {
      expect(
        sorted[index - 1]
          .influenceScore,
      ).toBeGreaterThanOrEqual(
        sorted[index]
          .influenceScore,
      );
    }
  });

  it("generates comparison rows", () => {
    const comparison =
      comparePerfumers(
        result.profiles.slice(0, 3),
      );

    expect(
      comparison.length,
    ).toBeGreaterThan(6);
    expect(
      Object.keys(
        comparison[0].values,
      ).length,
    ).toBeLessThanOrEqual(3);
  });
});
