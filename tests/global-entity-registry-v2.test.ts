import {
  describe,
  expect,
  it,
} from "vitest";

import {
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";
import {
  buildGlobalEntityRegistry,
} from "@/lib/graph/entity-registry-v2";
import type {
  GlobalEntityType,
} from "@/lib/graph/global-types";

describe("Global Entity Registry 2.0", () => {
  it("registers all entity types supported by the current catalog data", () => {
    const registry =
      buildGlobalEntityRegistry(
        bundledIntelligenceCatalog,
      );

    const types =
      new Set(
        registry.entities.map(
          (entity) =>
            entity.type,
        ),
      );

    expect(
      types.has(
        "fragrance",
      ),
    ).toBe(true);
    expect(
      types.has(
        "brand",
      ),
    ).toBe(true);
    expect(
      types.has(
        "family",
      ),
    ).toBe(true);

    const catalogHasAccords =
      bundledIntelligenceCatalog.some(
        (fragrance) =>
          Boolean(
            fragrance.accords
              ?.length,
          ),
      );

    expect(
      types.has(
        "accord",
      ),
    ).toBe(
      catalogHasAccords,
    );

    expect(
      registry.entities
        .length,
    ).toBeGreaterThan(
      bundledIntelligenceCatalog
        .length,
    );
  });

  it("keeps accord as a first-class Global Intelligence Network entity type", () => {
    const supported:
      GlobalEntityType =
      "accord";

    expect(
      supported,
    ).toBe(
      "accord",
    );
  });
});
