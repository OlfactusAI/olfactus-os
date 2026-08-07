import { describe, expect, it } from "vitest";
import { fragrances } from "@/lib/data/fragrances";
import { buildEntityRegistry } from "@/lib/entities/registry";
import { searchEntityRegistry } from "@/lib/search/entity-search";

describe("Universal entity search", () => {
  it("routes results through the entity platform", () => {
    const registry = buildEntityRegistry(fragrances);
    const first = fragrances[0];
    const results = searchEntityRegistry({
      registry,
      query: first.name,
    });
    expect(results[0]?.href).toContain("/entity/");
  });
});
