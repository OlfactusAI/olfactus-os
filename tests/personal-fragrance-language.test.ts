import {
  describe,
  expect,
  it,
} from "vitest";

import {
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";
import {
  interpretFragranceRequest,
} from "@/lib/language/interpreter";

describe("Personal Fragrance Language", () => {
  it("translates relative descriptive language into real constraints", () => {
    const collectorEmbedding = {
      modelVersion:
        "PEM-1.0.0" as const,
      generatedAt:
        "2026-08-06T12:00:00.000Z",
      confidence: 80,
      dimensions:
        Object.fromEntries(
          [
            "freshness","sweetness","darkness","dryness","warmth","density","airiness","projection","formality","novelty","familiarity","creaminess","smokiness","greenness","fruitiness","floral","mineral","cleanliness","woodiness","amber","complexity",
          ].map(
            (key) => [
              key,
              50,
            ],
          ),
        ) as any,
      strongestDimensions: [],
      evidence: [],
    };

    const result =
      interpretFragranceRequest({
        text:
          "cleaner than Naxos, darker than Imagination, less sweet than Layton and more formal",
        catalog:
          bundledIntelligenceCatalog,
        collectorEmbedding,
      });

    expect(
      result.constraints.some(
        (item) =>
          item.dimension ===
          "cleanliness",
      ),
    ).toBe(true);
    expect(
      result.constraints.some(
        (item) =>
          item.dimension ===
          "darkness",
      ),
    ).toBe(true);
    expect(
      result.constraints.some(
        (item) =>
          item.dimension ===
          "sweetness" &&
          item.operator ===
          "less",
      ),
    ).toBe(true);
    expect(
      result.constraints.some(
        (item) =>
          item.dimension ===
          "formality",
      ),
    ).toBe(true);
  });
});
