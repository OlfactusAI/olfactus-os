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

describe("Dynamic public dossier resolution", () => {
  it("resolves every bundled fragrance by ID and generated slug", () => {
    const registry =
      buildEntityRegistry(
        fragrances,
      );

    for (
      const fragrance
      of fragrances
    ) {
      const byId =
        resolveEntity(
          registry,
          "fragrance",
          fragrance.id,
        );
      const bySlug =
        resolveEntity(
          registry,
          "fragrance",
          `${fragrance.brand} ${fragrance.name}`,
        );

      expect(
        byId?.id,
      ).toBe(
        fragrance.id,
      );
      expect(
        bySlug?.id,
      ).toBe(
        fragrance.id,
      );
    }
  });

  it("returns null instead of crashing when an entity is not active", () => {
    const registry =
      buildEntityRegistry(
        fragrances,
      );

    expect(
      resolveEntity(
        registry,
        "fragrance",
        "not-in-active-catalog",
      ),
    ).toBeNull();
  });
});
