import {
  describe,
  expect,
  it,
} from "vitest";

import {
  replayCollectorEvents,
} from "@/lib/events/collector-event-reducer";
import type {
  MemoryEvent,
} from "@/lib/memory/types";

const event = (
  type:
    MemoryEvent["type"],
  id: string,
): MemoryEvent => ({
  id:
    `${type}:${id}`,
  timestamp:
    "2026-08-06T12:00:00.000Z",
  type,
  source:
    "system",
  entity: {
    type:
      "fragrance",
    id,
  },
  confidence: 100,
  metadata: {},
  schemaVersion: 1,
});

describe("Collector event replay", () => {
  it("derives behavior from immutable memory events", () => {
    const result =
      replayCollectorEvents([
        event(
          "wear-recorded",
          "aventus",
        ),
        {
          ...event(
            "wear-recorded",
            "aventus",
          ),
          id:
            "wear:aventus:2",
        },
        event(
          "fragrance-viewed",
          "ganymede",
        ),
        event(
          "recommendation-accepted",
          "ganymede",
        ),
      ]);

    expect(
      result
        .wearCountByFragrance
        .aventus,
    ).toBe(
      2,
    );
    expect(
      result
        .viewCountByFragrance
        .ganymede,
    ).toBe(
      1,
    );
    expect(
      result.recommendationsAccepted,
    ).toBe(
      1,
    );
  });
});
