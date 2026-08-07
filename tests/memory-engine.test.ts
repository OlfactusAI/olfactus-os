import { describe, expect, it } from "vitest";
import {
  inferFamilyPreferenceMemory,
  inferWearContextMemory,
} from "@/lib/intelligence-everywhere/memory";

describe("Memory Engine", () => {
  it("requires repeated evidence before creating a memory", () => {
    expect(
      inferWearContextMemory({
        fragranceName: "Imagination",
        context: "interviews",
        evidenceCount: 2,
      }),
    ).toBeNull();

    expect(
      inferWearContextMemory({
        fragranceName: "Imagination",
        context: "interviews",
        evidenceCount: 4,
      })?.pattern,
    ).toBe("wear-context");
  });

  it("detects a dominant family preference", () => {
    expect(
      inferFamilyPreferenceMemory({
        family: "Woody",
        ownedCount: 5,
        wearShare: 0.34,
      })?.pattern,
    ).toBe("family-preference");
  });
});
