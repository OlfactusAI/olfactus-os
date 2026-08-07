import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fragrances as coreFragrances,
} from "@/lib/data/fragrances";
import {
  globalDiscoveryFragrances,
} from "@/lib/data/global-discovery-fragrances";
import {
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";

describe("Global Discovery Catalog", () => {
  it("contains a meaningful unowned discovery universe beyond the core collection fixture", () => {
    expect(
      globalDiscoveryFragrances
        .length,
    ).toBeGreaterThanOrEqual(
      60,
    );
    expect(
      bundledIntelligenceCatalog
        .length,
    ).toBeGreaterThan(
      coreFragrances.length,
    );

    const ids =
      bundledIntelligenceCatalog.map(
        (item) =>
          item.id,
      );

    expect(
      new Set(ids).size,
    ).toBe(
      ids.length,
    );
  });

  it("contains real named fragrance entities rather than synthetic benchmark records", () => {
    expect(
      bundledIntelligenceCatalog.some(
        (item) =>
          item.id ===
          "creed-aventus",
      ),
    ).toBe(true);
    expect(
      bundledIntelligenceCatalog.some(
        (item) =>
          item.id ===
          "bvlgari-tygar",
      ),
    ).toBe(true);
    expect(
      bundledIntelligenceCatalog.some(
        (item) =>
          item.id.startsWith(
            "synthetic-",
          ),
      ),
    ).toBe(false);
  });
});
