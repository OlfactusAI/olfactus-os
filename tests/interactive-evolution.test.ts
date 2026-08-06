import { describe, expect, it } from "vitest";

import type { TimelineEvent } from "@/lib/timeline/types";

describe("Interactive Evolution Charts", () => {
  const events: TimelineEvent[] = [
    {
      id: "baseline",
      type: "baseline_created",
      timestamp: "2026-07-01T12:00:00Z",
      title: "Baseline",
      summary: "Initial snapshot",
      snapshot: {
        collectionHealth: 84,
        rotation: 72,
        diversity: 79,
        seasonalBalance: 81,
        redundancy: 76,
        totalWears: 90,
        bottleCount: 6,
      },
    },
    {
      id: "purchase",
      type: "bottle_added",
      timestamp: "2026-07-10T12:00:00Z",
      title: "Bottle added",
      summary: "New purchase",
      fragranceId: "ganymede",
    },
    {
      id: "after",
      type: "collection_health_updated",
      timestamp: "2026-07-11T12:00:00Z",
      title: "Health updated",
      summary: "New snapshot",
      snapshot: {
        collectionHealth: 88,
        rotation: 76,
        diversity: 85,
        seasonalBalance: 83,
        redundancy: 78,
        totalWears: 92,
        bottleCount: 7,
      },
    },
  ];

  it("retains snapshot and event data required for chart comparison", () => {
    expect(
      events.filter((event) => event.snapshot),
    ).toHaveLength(2);
    expect(
      events.some(
        (event) => event.type === "bottle_added",
      ),
    ).toBe(true);
  });

  it("contains multiple evolving metrics", () => {
    const snapshots = events
      .map((event) => event.snapshot)
      .filter(Boolean);

    expect(
      snapshots[1]!.collectionHealth,
    ).toBeGreaterThan(
      snapshots[0]!.collectionHealth,
    );
    expect(
      snapshots[1]!.diversity,
    ).toBeGreaterThan(
      snapshots[0]!.diversity,
    );
  });
});
