import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  buildFamilyAffinities,
} from "@/lib/predictive/preference-model";
import type {
  MemoryEvent,
} from "@/lib/memory/types";

describe("Predictive preference model", () => {
  it("learns family affinity from repeated wears", () => {
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

    const affinity =
      buildFamilyAffinities({
        events,
        catalog:
          fragrances,
      })[0];

    expect(
      affinity?.id,
    ).toBe(
      fragrance.family.toLowerCase(),
    );
    expect(
      affinity?.score,
    ).toBe(
      100,
    );
  });
});
