import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoCollection,
  demoProfile,
} from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import {
  analyzeCollectionEvolution,
  analyzePurchaseImpact,
  compareEvolutionSnapshots,
  createEvolutionSnapshot,
} from "@/lib/intelligence/collection-evolution-engine";

describe("Collection Evolution Engine", () => {
  const baseline =
    createEvolutionSnapshot({
      collection:
        demoCollection.slice(0, 4),
      catalog: fragrances,
      profile: demoProfile,
      source: "baseline",
      createdAt:
        "2026-01-01T12:00:00.000Z",
    });

  const expanded =
    createEvolutionSnapshot({
      collection: demoCollection,
      catalog: fragrances,
      profile: demoProfile,
      source: "purchase",
      createdAt:
        "2026-03-01T12:00:00.000Z",
    });

  it("creates complete historical snapshots", () => {
    expect(
      baseline.collectionSize,
    ).toBe(4);
    expect(
      baseline.collectionHealth,
    ).toBeGreaterThanOrEqual(0);
    expect(
      baseline.dna.fresh,
    ).toBeGreaterThanOrEqual(0);
    expect(
      Object.keys(baseline.roles),
    ).toHaveLength(9);
  });

  it("compares snapshots and explains collection evolution", () => {
    const result =
      analyzeCollectionEvolution({
        snapshots: [
          baseline,
          expanded,
        ],
      });

    expect(result.modelVersion).toBe(
      "CEE-1.0.0",
    );
    expect(result.snapshotCount).toBe(2);
    expect(
      result.metricDeltas.length,
    ).toBeGreaterThan(4);
    expect(
      result.briefing.length,
    ).toBeGreaterThan(100);
  });

  it("calculates before-and-after metric deltas", () => {
    const comparison =
      compareEvolutionSnapshots(
        baseline,
        expanded,
      );

    expect(
      comparison.collectionSize,
    ).toBe(
      expanded.collectionSize -
        baseline.collectionSize,
    );
    expect(
      Object.keys(comparison.dna),
    ).toHaveLength(8);
  });

  it("analyzes purchase impact", () => {
    const added =
      fragrances.find(
        (item) =>
          !baseline.ownedFragranceIds.includes(
            item.id,
          ),
      )!;

    const result =
      analyzePurchaseImpact({
        before: baseline,
        after: expanded,
        fragrance: added,
      });

    expect(
      result.fragranceId,
    ).toBe(added.id);
    expect(
      result.summary.length,
    ).toBeGreaterThan(80);
    expect(
      result.strongestDnaChange.dimension,
    ).toBeTruthy();
  });
});
