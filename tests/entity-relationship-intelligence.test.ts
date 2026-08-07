import { describe, expect, it } from "vitest";
import { fragrances } from "@/lib/data/fragrances";
import { calculateFragranceRelationships } from "@/lib/entities/relationship-intelligence";

describe("Relationship intelligence", () => {
  it("returns evidence-backed relationships", () => {
    const results = calculateFragranceRelationships(
      fragrances[0],
      fragrances,
    );
    for (const result of results) {
      expect(result.strength).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.evidence).toBeInstanceOf(Array);
    }
  });
});
