import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculatePredictionCalibration,
} from "@/lib/predictive/calibration";
import type {
  MemoryEvent,
} from "@/lib/memory/types";

const event = (
  type:
    MemoryEvent["type"],
  index: number,
): MemoryEvent => ({
  id:
    `${type}:${index}`,
  timestamp:
    "2026-08-06T12:00:00.000Z",
  type,
  source:
    "analyst",
  confidence: 90,
  metadata: {},
  schemaVersion: 1,
});

describe("Prediction calibration", () => {
  it("learns from accepted and ignored recommendation outcomes", () => {
    const calibration =
      calculatePredictionCalibration([
        event(
          "recommendation-shown",
          1,
        ),
        event(
          "recommendation-accepted",
          2,
        ),
        event(
          "recommendation-ignored",
          3,
        ),
      ]);

    expect(
      calibration.acceptanceRate,
    ).toBe(
      50,
    );
    expect(
      calibration.state,
    ).toBe(
      "insufficient",
    );
  });
});
