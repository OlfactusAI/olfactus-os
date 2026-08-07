import {
  describe,
  expect,
  it,
} from "vitest";

import {
  generateMemoryInsights,
} from "@/lib/memory/learning";
import type {
  MemoryEvent,
} from "@/lib/memory/types";

describe("Memory learning engine", () => {
  it("requires repeated evidence before inferring a rotation leader", () => {
    const events:
      MemoryEvent[] =
      [1, 2, 3].map(
        (index) => ({
          id:
            `wear:${index}`,
          timestamp:
            `2026-08-0${index}T12:00:00.000Z`,
          type:
            "wear-recorded",
          source:
            "collection",
          entity: {
            type:
              "fragrance",
            id:
              "ganymede",
          },
          confidence: 100,
          metadata: {},
          schemaVersion: 1,
        }),
      );

    expect(
      generateMemoryInsights(
        events,
      ).some(
        (insight) =>
          insight.id.includes(
            "most-worn",
          ),
      ),
    ).toBe(true);
  });
});
