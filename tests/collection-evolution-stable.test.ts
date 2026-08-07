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
  createEvolutionSnapshot,
} from "@/lib/intelligence/collection-evolution-engine";

describe("Collection Evolution Stable", () => {
  it("records an explicit capture reason", () => {
    const snapshot =
      createEvolutionSnapshot({
        collection: demoCollection,
        catalog: fragrances,
        profile: demoProfile,
        source: "manual",
        captureReason:
          "manual-capture",
      });

    expect(
      snapshot.captureReason,
    ).toBe("manual-capture");
  });

  it("preserves evolution analysis across multiple snapshot reasons", () => {
    const snapshots = [
      createEvolutionSnapshot({
        collection:
          demoCollection.slice(0, 2),
        catalog: fragrances,
        profile: demoProfile,
        source: "baseline",
        captureReason:
          "tracking-started",
        createdAt:
          "2026-01-01T12:00:00.000Z",
      }),
      createEvolutionSnapshot({
        collection:
          demoCollection.slice(0, 4),
        catalog: fragrances,
        profile: demoProfile,
        source: "automatic",
        captureReason:
          "collection-changed",
        createdAt:
          "2026-04-01T12:00:00.000Z",
      }),
      createEvolutionSnapshot({
        collection: demoCollection,
        catalog: fragrances,
        profile: demoProfile,
        source: "automatic",
        captureReason:
          "wear-milestone",
        createdAt:
          "2026-08-01T12:00:00.000Z",
      }),
    ];

    const result =
      analyzeCollectionEvolution({
        snapshots,
      });

    expect(result.snapshotCount).toBe(3);
    expect(
      result.latestSnapshot
        ?.captureReason,
    ).toBe("wear-milestone");
    expect(
      result.briefing.length,
    ).toBeGreaterThan(100);
  });
});
