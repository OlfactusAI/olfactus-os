import { describe, expect, it } from "vitest";
import { buildRecommendationTrace } from "@/lib/intelligence-everywhere/recommendation-trace";

describe("Recommendation Trace", () => {
  it("builds a complete reasoning path", () => {
    const trace = buildRecommendationTrace({
      recommendation: "Imagination",
      confidence: 94,
      weather: "Warm",
      collection: "Low redundancy",
      roleGap: "Fresh luxury",
      budget: "Owned",
      dnaDiversity: "Positive",
      performance: "Strong",
    });

    expect(trace.steps.map((step) => step.id)).toEqual([
      "weather",
      "collection",
      "role-gap",
      "budget",
      "dna-diversity",
      "performance",
    ]);
  });
});
