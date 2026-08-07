import {
  describe,
  expect,
  it,
} from "vitest";

import {
  demoCollection,
} from "@/lib/data/demo";
import {
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";

describe("Decision Lab global candidate universe", () => {
  it("leaves many candidate fragrances after subtracting the current collection", () => {
    const ownedIds =
      new Set(
        demoCollection.map(
          (item) =>
            item.fragranceId,
        ),
      );

    const candidates =
      bundledIntelligenceCatalog.filter(
        (fragrance) =>
          !ownedIds.has(
            fragrance.id,
          ),
      );

    expect(
      candidates.length,
    ).toBeGreaterThan(
      50,
    );
  });
});
