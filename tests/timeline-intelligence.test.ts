import { describe, expect, it } from "vitest";

import { analyzeTimelineIntelligence } from "@/lib/intelligence/timeline-intelligence-engine";
import type { TimelineEvent } from "@/lib/timeline/types";

const events: TimelineEvent[] = [
  {
    id: "baseline",
    type: "baseline_created",
    timestamp: "2026-07-01T12:00:00Z",
    title: "Baseline",
    summary: "Initial state",
    snapshot: {
      collectionHealth: 86,
      rotation: 74,
      diversity: 80,
      seasonalBalance: 82,
      redundancy: 78,
      totalWears: 90,
      bottleCount: 6,
    },
  },
  {
    id: "wear",
    type: "wear_logged",
    timestamp: "2026-07-15T12:00:00Z",
    title: "Wear logged",
    summary: "Imagination worn",
    fragranceId: "imagination",
  },
  {
    id: "update",
    type: "collection_health_updated",
    timestamp: "2026-08-01T12:00:00Z",
    title: "Updated",
    summary: "Improved state",
    snapshot: {
      collectionHealth: 91,
      rotation: 83,
      diversity: 84,
      seasonalBalance: 86,
      redundancy: 81,
      totalWears: 103,
      bottleCount: 7,
    },
  },
];

describe("Timeline Intelligence Engine", () => {
  it("builds trends, briefing, milestones, and projection", () => {
    const result = analyzeTimelineIntelligence({
      events,
      ledgerCreatedAt: "2026-07-01T12:00:00Z",
    });

    expect(result.modelVersion).toBe("TIE-1.0.0");
    expect(result.healthTrend).toHaveLength(2);
    expect(result.currentSnapshot?.collectionHealth).toBe(91);
    expect(result.briefing.length).toBeGreaterThan(100);
    expect(result.milestones.length).toBeGreaterThan(4);
    expect(result.projection).not.toBeNull();
  });

  it("counts recorded events", () => {
    const result = analyzeTimelineIntelligence({
      events,
      ledgerCreatedAt: "2026-07-01T12:00:00Z",
    });

    expect(result.totalEvents).toBe(3);
    expect(result.totalWearsLogged).toBe(1);
  });
});
