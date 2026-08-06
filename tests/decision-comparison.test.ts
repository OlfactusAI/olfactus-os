import { describe, expect, it } from "vitest";

import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import { compareDecisionCandidates } from "@/lib/intelligence/decision-comparison-engine";

describe("Decision Comparison Engine", () => {
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

  it("selects one winner and compares ten categories", () => {
    const result = compareDecisionCandidates({
      firstCandidate: candidates[0],
      secondCandidate: candidates[1],
      owned,
      analysis,
    });

    expect(result.modelVersion).toBe("DC-1.0.0");
    expect(result.categories).toHaveLength(10);
    expect([
      candidates[0].id,
      candidates[1].id,
    ]).toContain(result.winner.candidate.id);
    expect(result.analystVerdict.length).toBeGreaterThan(100);
  });

  it("does not allow a fragrance to compare against itself", () => {
    expect(() =>
      compareDecisionCandidates({
        firstCandidate: candidates[0],
        secondCandidate: candidates[0],
        owned,
        analysis,
      }),
    ).toThrow();
  });

  it("responds to different observed prices", () => {
    const normal = compareDecisionCandidates({
      firstCandidate: candidates[0],
      secondCandidate: candidates[1],
      owned,
      analysis,
      firstPrice: 180,
      secondPrice: 180,
    });

    const expensive = compareDecisionCandidates({
      firstCandidate: candidates[0],
      secondCandidate: candidates[1],
      owned,
      analysis,
      firstPrice: 650,
      secondPrice: 180,
    });

    expect(expensive.first.metrics.value).toBeLessThan(
      normal.first.metrics.value,
    );
  });
});
