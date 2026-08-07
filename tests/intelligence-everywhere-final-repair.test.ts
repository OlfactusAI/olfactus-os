import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildCollectionHealthExplanation,
} from "@/lib/intelligence-everywhere/explain-score";
import {
  generateCollectionHealthEvent,
  readIntelligenceEvents,
} from "@/lib/intelligence-everywhere/events";

describe("Intelligence Everywhere final repair", () => {
  it("treats excessive redundancy as negative evidence", () => {
    const result =
      buildCollectionHealthExplanation({
        healthScore: 87,
        roleCoverage: 92,
        seasonalBalance: 84,
        dnaDiversity: 86,
        redundancy: 48,
        rotationBalance: 73,
      });

    expect(
      result.negatives,
    ).toContain(
      "Too many bottles overlap.",
    );
  });

  it("preserves typed event contracts", () => {
    const events =
      readIntelligenceEvents();

    expect(
      events,
    ).toBeInstanceOf(
      Array,
    );
    expect(
      generateCollectionHealthEvent({
        previousScore: 87,
        nextScore: 91,
      })?.severity,
    ).toBe(
      "positive",
    );
  });
});
