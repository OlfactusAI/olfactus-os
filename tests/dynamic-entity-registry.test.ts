import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  buildEntityRegistry,
  resolveEntity,
} from "@/lib/entities/registry";

describe("Dynamic Entity Registry", () => {
  it("creates a fragrance entity for every active catalog record", () => {
    const registry =
      buildEntityRegistry(
        fragrances,
      );
    const fragranceEntities =
      registry.entities.filter(
        (entity) =>
          entity.type ===
          "fragrance",
      );

    expect(
      fragranceEntities,
    ).toHaveLength(
      fragrances.length,
    );
  });

  it("resolves brands and families without hardcoded routes", () => {
    const registry =
      buildEntityRegistry(
        fragrances,
      );
    const first =
      fragrances[0];

    expect(
      resolveEntity(
        registry,
        "brand",
        first.brand,
      )?.label,
    ).toBe(first.brand);

    expect(
      resolveEntity(
        registry,
        "family",
        first.family,
      )?.label,
    ).toBe(
      first.family,
    );
  });

  it("creates bidirectional relationship navigation", () => {
    const registry =
      buildEntityRegistry(
        fragrances,
      );
    const first =
      fragrances[0];
    const fragrance =
      resolveEntity(
        registry,
        "fragrance",
        first.id,
      );
    const brand =
      resolveEntity(
        registry,
        "brand",
        first.brand,
      );

    expect(
      fragrance?.relationships
        .length,
    ).toBeGreaterThan(0);
    expect(
      brand?.relationships
        .some(
          (relationship) =>
            relationship.targetId ===
            fragrance?.canonicalId,
        ),
    ).toBe(true);
  });
});
