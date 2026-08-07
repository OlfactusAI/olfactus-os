import {
  describe,
  expect,
  it,
} from "vitest";

import {
  summarizeMemory,
} from "@/lib/memory/queries";
import type {
  MemoryEvent,
} from "@/lib/memory/types";

const event = (
  type:
    MemoryEvent["type"],
  entityId?: string,
  index = 0,
): MemoryEvent => ({
  id:
    `${type}:${entityId ?? "none"}:${index}`,
  timestamp:
    "2026-08-06T12:00:00.000Z",
  type,
  source:
    "system",
  entity:
    entityId
      ? {
          type:
            "fragrance",
          id:
            entityId,
        }
      : undefined,
  confidence: 100,
  metadata: {},
  schemaVersion: 1,
});

describe("Memory query API", () => {
  it("summarizes wear and recommendation behavior", () => {
    const summary =
      summarizeMemory([
        event(
          "wear-recorded",
          "aventus",
          1,
        ),
        event(
          "wear-recorded",
          "aventus",
          2,
        ),
        event(
          "recommendation-shown",
          "aventus",
          3,
        ),
        event(
          "recommendation-accepted",
          "aventus",
          4,
        ),
      ]);

    expect(
      summary.mostWornFragranceId,
    ).toBe(
      "aventus",
    );
    expect(
      summary.mostWornCount,
    ).toBe(
      2,
    );
    expect(
      summary.recommendationAcceptanceRate,
    ).toBe(
      100,
    );
  });
});
