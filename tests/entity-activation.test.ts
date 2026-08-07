import { describe, expect, it } from "vitest";
import { fragrances } from "@/lib/data/fragrances";
import { activateFragranceEntity } from "@/lib/entities/activation";

describe("Entity activation pipeline", () => {
  it("generates stable aliases", () => {
    const fragrance = fragrances[0];
    const result = activateFragranceEntity(fragrance);
    expect(result.generatedAliases).toContain(fragrance.id);
    expect(result.generatedAliases).toContain(
      `${fragrance.brand} ${fragrance.name}`,
    );
  });
});
