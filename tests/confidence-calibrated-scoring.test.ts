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

const ready:
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

const partial:
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

describe("Confidence-Calibrated Scoring", () => {
  it("produces a narrow range for strong validated evidence", () => {
    const result =
      calibrateIntelligenceScore({
        rawScore: 84,
        eligibility: ready,
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
    expect(
      result.uncertainty,
    ).toBeLessThanOrEqual(8);
    expect(result.range[0]).toBeLessThan(84);
    expect(result.range[1]).toBeGreaterThan(84);
  });

  it("widens uncertainty for partial evidence", () => {
    const result =
      calibrateIntelligenceScore({
        rawScore: 74,
        eligibility: partial,
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
    expect(
      result.warnings,
    ).toContain(
      "Limited confidence.",
    );
  });

  it("keeps score ranges inside 0 to 100", () => {
    const high =
      calibrateIntelligenceScore({
        rawScore: 99,
        eligibility: partial,
        evidenceSignals: [],
      });
    const low =
      calibrateIntelligenceScore({
        rawScore: 1,
        eligibility: partial,
        evidenceSignals: [],
      });

    expect(high.range[1]).toBe(100);
    expect(low.range[0]).toBe(0);
  });
});
