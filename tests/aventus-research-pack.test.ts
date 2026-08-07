import {
  describe,
  expect,
  it,
} from "vitest";
import {
  aventusReferenceResearchPack,
  getResearchFactsForSection,
} from "@/lib/gold-standard-builder/research-packs";

describe("Aventus Gold Standard research pack", () => {
  it("contains sourced evidence but no OLFACTUS calibration scores", () => {
    expect(
      aventusReferenceResearchPack.fragranceId,
    ).toBe(
      "creed:aventus",
    );

    expect(
      aventusReferenceResearchPack.policy.scoresIncluded,
    ).toBe(false);

    expect(
      aventusReferenceResearchPack.sources.length,
    ).toBeGreaterThanOrEqual(4);

    expect(
      aventusReferenceResearchPack.facts.length,
    ).toBeGreaterThanOrEqual(10);
  });

  it("maps shared research evidence to calibration sections", () => {
    expect(
      getResearchFactsForSection(
        "creed:aventus",
        "performance",
      ).length,
    ).toBeGreaterThan(0);

    expect(
      getResearchFactsForSection(
        "creed:aventus",
        "collector",
      ).length,
    ).toBeGreaterThan(0);
  });
});
