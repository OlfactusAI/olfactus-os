import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calibrateIntelligenceScore,
} from "@/lib/intelligence/confidence-calibration";
import type {
  IntelligenceEligibility,
} from "@/lib/intelligence/readiness-gateway";

describe("Confidence calibration threshold repair", () => {
  it("keeps strong validated evidence at or above 80 percent confidence", () => {
    const eligibility:
      IntelligenceEligibility = {
        readiness: "ready",
        confidence: 96,
        allowedEngines: [
          "recommendation",
        ],
        restrictedEngines: [],
        warnings: [],
        missingFields: [],
      };

    const result =
      calibrateIntelligenceScore({
        rawScore: 84,
        eligibility,
        evidenceSignals: [
          {
            id: "one",
            strength: 86,
            source:
              "explicit",
          },
          {
            id: "two",
            strength: 84,
            source:
              "derived",
          },
          {
            id: "three",
            strength: 88,
            source:
              "derived",
          },
          {
            id: "four",
            strength: 82,
            source:
              "explicit",
          },
          {
            id: "five",
            strength: 85,
            source:
              "derived",
          },
        ],
      });

    expect(
      result.confidence,
    ).toBeGreaterThanOrEqual(
      80,
    );
  });

  it("classifies a two-signal partial record as partial evidence", () => {
    const eligibility:
      IntelligenceEligibility = {
        readiness: "partial",
        confidence: 64,
        allowedEngines: [
          "recommendation",
        ],
        restrictedEngines: [],
        warnings: [
          "Limited confidence.",
        ],
        missingFields: [
          "notes",
          "performance",
        ],
      };

    const result =
      calibrateIntelligenceScore({
        rawScore: 74,
        eligibility,
        evidenceSignals: [
          {
            id: "one",
            strength: 82,
            source:
              "derived",
          },
          {
            id: "two",
            strength: 49,
            source:
              "inferred",
          },
        ],
      });

    expect(
      result.evidenceQuality,
    ).toBe("partial");
    expect(
      result.uncertainty,
    ).toBeGreaterThan(8);
  });
});
