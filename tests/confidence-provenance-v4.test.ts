import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createScoreProvenance,
} from "@/lib/intelligence-api/provenance";

describe("Confidence provenance", () => {
  it("normalizes evidence contribution while preserving model identity", () => {
    const provenance =
      createScoreProvenance({
        score: 84,
        confidence: 78,
        modelId:
          "COLLECTOR-STATE",
        generatedAt:
          "2026-08-06T12:00:00.000Z",
        evidence: [
          {
            id: "wears",
            label:
              "Wear history",
            kind:
              "observed-behavior",
            contribution: 34,
            detail:
              "Repeated wears.",
          },
          {
            id:
              "collection",
            label:
              "Collection state",
            kind:
              "direct-user",
            contribution: 66,
            detail:
              "Owned bottles.",
          },
        ],
      });

    expect(
      provenance.model,
    ).toBe(
      "COLLECTOR-STATE-1.0.0",
    );
    expect(
      provenance.evidence.reduce(
        (sum, item) =>
          sum +
          Math.abs(
            item.contribution,
          ),
        0,
      ),
    ).toBe(
      100,
    );
  });
});
