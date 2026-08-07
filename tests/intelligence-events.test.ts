import { describe, expect, it } from "vitest";
import { generateCollectionHealthEvent } from "@/lib/intelligence-everywhere/events";

describe("Intelligence Events", () => {
  it("generates a collection health event only when the score changes", () => {
    expect(
      generateCollectionHealthEvent({
        previousScore: 87,
        nextScore: 91,
      })?.type,
    ).toBe("collection-health-change");

    expect(
      generateCollectionHealthEvent({
        previousScore: 91,
        nextScore: 91,
      }),
    ).toBeNull();
  });
});
