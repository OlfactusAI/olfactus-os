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
  compareEvolutionSnapshots,
  createEvolutionSnapshot,
} from "@/lib/intelligence/collection-evolution-engine";

describe("Interactive Collection Replay", () => {
  const snapshots = [
    createEvolutionSnapshot({
      collection:
        demoCollection.slice(0, 2),
      catalog: fragrances,
      profile: demoProfile,
      source: "baseline",
      createdAt:
        "2026-01-01T12:00:00.000Z",
    }),
    createEvolutionSnapshot({
      collection:
        demoCollection.slice(0, 4),
      catalog: fragrances,
      profile: demoProfile,
      source: "automatic",
      createdAt:
        "2026-03-01T12:00:00.000Z",
    }),
    createEvolutionSnapshot({
      collection: demoCollection,
      catalog: fragrances,
      profile: demoProfile,
      source: "automatic",
      createdAt:
        "2026-06-01T12:00:00.000Z",
    }),
  ];

  it("supports ordered multi-snapshot replay", () => {
    const result =
      analyzeCollectionEvolution({
        snapshots,
      });

    expect(result.snapshotCount).toBe(3);
    expect(result.firstSnapshot?.collectionSize).toBe(2);
    expect(result.latestSnapshot?.collectionSize).toBe(
      demoCollection.length,
    );
  });

  it("provides complete comparison data for the replay UI", () => {
    const comparison =
      compareEvolutionSnapshots(
        snapshots[0],
        snapshots[2],
      );

    expect(comparison.collectionSize).toBe(
      demoCollection.length - 2,
    );
    expect(Object.keys(comparison.dna)).toHaveLength(8);
    expect(
      Number.isFinite(comparison.health),
    ).toBe(true);
  });

  it("unlocks trend-history milestones with three snapshots", () => {
    const result =
      analyzeCollectionEvolution({
        snapshots,
      });

    const milestone =
      result.milestones.find(
        (item) =>
          item.id === "three-snapshots",
      );

    expect(milestone?.achieved).toBe(true);
    expect(milestone?.progress).toBe(100);
  });
});
