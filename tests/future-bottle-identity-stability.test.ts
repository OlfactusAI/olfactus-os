import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoCollection,
  demoProfile,
} from "@/lib/data/demo";
import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  forecastCollection,
} from "@/lib/prediction/collection-forecast";

describe("Future bottle identity stability", () => {
  it("keeps the same unique owned fragrance IDs at every forecast horizon", () => {
    const forecast =
      forecastCollection({
        collection:
          demoCollection,
        catalog:
          fragrances,
        profile:
          demoProfile,
        events: [],
      });

    const uniqueOwnedIds =
      [
        ...new Set(
          demoCollection.map(
            (item) =>
              item.fragranceId,
          ),
        ),
      ].sort();

    for (
      const point
      of forecast.points
    ) {
      const ids =
        point.bottleStates
          .map(
            (bottle) =>
              bottle.fragranceId,
          )
          .sort();

      expect(
        new Set(ids).size,
      ).toBe(
        ids.length,
      );
      expect(ids).toEqual(
        uniqueOwnedIds,
      );
    }
  });
});
