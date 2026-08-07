import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  detectTasteDrift,
} from "@/lib/predictive/drift-engine";
import type {
  MemoryEvent,
} from "@/lib/memory/types";

describe("Taste drift engine", () => {
  it("requires longitudinal wear evidence", () => {
    const fragrance =
      fragrances[0];
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
              fragrance.id,
          },
          confidence: 100,
          metadata: {},
          schemaVersion: 1,
        }),
      );

    expect(
      detectTasteDrift({
        events,
        catalog:
          fragrances,
      }),
    ).toEqual([]);
  });
});
