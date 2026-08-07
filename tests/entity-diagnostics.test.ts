import { describe, expect, it } from "vitest";
import { fragrances } from "@/lib/data/fragrances";
import { diagnoseEntityRegistry } from "@/lib/entities/diagnostics";
import { buildEntityRegistry } from "@/lib/entities/registry";

describe("Entity diagnostics", () => {
  it("reports registry integrity", () => {
    const result = diagnoseEntityRegistry(
      buildEntityRegistry(fragrances),
    );
    expect(result.entityCount).toBeGreaterThan(0);
    expect(result.brokenRelationshipCount).toBe(0);
  });
});
