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
import {
  findSemanticCandidates,
} from "@/lib/semantic/search";

const baseEmbedding = {
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

describe("Semantic ranking behavior", () => {
  it("changes ranking when the user asks for less sweetness", () => {
    const sweetRequest =
      interpretFragranceRequest({
        text:
          "something sweeter and warmer",
        catalog:
          bundledIntelligenceCatalog,
        collectorEmbedding:
          baseEmbedding,
      });
    const dryRequest =
      interpretFragranceRequest({
        text:
          "something less sweet and drier",
        catalog:
          bundledIntelligenceCatalog,
        collectorEmbedding:
          baseEmbedding,
      });

    const sweet =
      findSemanticCandidates({
        request:
          sweetRequest,
        collectorEmbedding:
          baseEmbedding,
        catalog:
          bundledIntelligenceCatalog,
        limit: 10,
      }).map(
        (item) =>
          item.fragrance.id,
      );

    const dry =
      findSemanticCandidates({
        request:
          dryRequest,
        collectorEmbedding:
          baseEmbedding,
        catalog:
          bundledIntelligenceCatalog,
        limit: 10,
      }).map(
        (item) =>
          item.fragrance.id,
      );

    expect(
      sweet,
    ).not.toEqual(
      dry,
    );
  });
});
