import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  buildCollectionSignal,
  buildLiveCollectionSnapshot,
  chooseLiveWearRecommendation,
} from "@/lib/intelligence-everywhere/live-selectors";

describe("Live intelligence selectors", () => {
  it("derives dashboard values from collection records", () => {
    const first =
      fragrances[0];
    const snapshot =
      buildLiveCollectionSnapshot({
        catalog:
          fragrances,
        collection: [
          {
            fragranceId:
              first.id,
            wearCount: 3,
            lastWornAt:
              "2026-01-01",
          },
        ],
      });

    expect(
      snapshot.collectionSize,
    ).toBe(1);
    expect(
      snapshot.healthScore,
    ).toBeGreaterThan(
      0,
    );
    expect(
      snapshot.topWearFragranceId,
    ).toBe(
      first.id,
    );
  });

  it("builds a recommendation from owned fragrances", () => {
    const first =
      fragrances[0];
    const result =
      chooseLiveWearRecommendation({
        catalog:
          fragrances,
        collection: [
          {
            fragranceId:
              first.id,
            wearCount: 1,
          },
        ],
      });

    expect(
      result?.fragranceId,
    ).toBe(
      first.id,
    );
  });

  it("labels an empty collection honestly", () => {
    const signal =
      buildCollectionSignal(
        buildLiveCollectionSnapshot({
          catalog:
            fragrances,
          collection: [],
        }),
      );

    expect(
      signal.label,
    ).toBe(
      "Collection empty",
    );
  });
});
