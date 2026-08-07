import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateCollectorDna,
} from "@/lib/memory/collector-dna";
import type {
  MemoryEvent,
} from "@/lib/memory/types";

describe("Collector DNA engine", () => {
  it("derives explorer behavior from searches and comparisons", () => {
    const events:
      MemoryEvent[] = [
      "search-executed",
      "search-executed",
      "comparison-executed",
    ].map(
      (
        type,
        index,
      ) => ({
        id:
          `${type}:${index}`,
        timestamp:
          "2026-08-06T12:00:00.000Z",
        type:
          type as MemoryEvent["type"],
        source:
          "analyst",
        confidence: 90,
        metadata: {},
        schemaVersion: 1,
      }),
    );

    expect(
      calculateCollectorDna(
        events,
      )[0]?.id,
    ).toBe(
      "explorer",
    );
  });
});
