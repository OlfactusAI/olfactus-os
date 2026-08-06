import { describe, expect, it } from "vitest";

import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import {
  defaultCoachMemory,
  runCollectionCoach,
} from "@/lib/intelligence/collection-coach-engine";

describe("AI Collection Coach", () => {
  const analysis = analyzeCollectionHealth({
    collection: demoCollection,
    profile: demoProfile,
    catalog: fragrances,
  });

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
            daysSinceLastWear:
              item.daysSinceLastWear,
            favorite: item.favorite,
          }
        : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        fragrance: (typeof fragrances)[number];
        wearCount: number;
        daysSinceLastWear: number;
        favorite: boolean;
      } => Boolean(entry),
    );

  const available = fragrances.filter(
    (fragrance) => !ownedIds.has(fragrance.id),
  );

  it("generates a briefing, priorities, timeline, and goal", () => {
    const result = runCollectionCoach({
      owned,
      available,
      analysis,
      memory: defaultCoachMemory,
      now: new Date("2026-08-05T12:00:00Z"),
    });

    expect(result.modelVersion).toBe("CC-1.0.0");
    expect(result.briefing.length).toBeGreaterThan(100);
    expect(result.priorities.length).toBeGreaterThan(0);
    expect(result.timeline).toHaveLength(7);
    expect(result.goal.progress).toBeGreaterThan(0);
    expect(result.opportunities.length).toBeGreaterThan(0);
  });

  it("respects dismissed coaching actions", () => {
    const first = runCollectionCoach({
      owned,
      available,
      analysis,
      memory: defaultCoachMemory,
    });

    const dismissedId = first.priorities[0].id;

    const second = runCollectionCoach({
      owned,
      available,
      analysis,
      memory: {
        ...defaultCoachMemory,
        dismissedActionIds: [dismissedId],
      },
    });

    expect(
      second.priorities.some(
        (action) => action.id === dismissedId,
      ),
    ).toBe(false);
  });

  it("supports alternate coaching goals", () => {
    const result = runCollectionCoach({
      owned,
      available,
      analysis,
      memory: {
        ...defaultCoachMemory,
        activeGoal: "rotation",
      },
    });

    expect(result.goal.goal).toBe("rotation");
    expect(result.goal.label).toContain("Rotation");
  });
});
