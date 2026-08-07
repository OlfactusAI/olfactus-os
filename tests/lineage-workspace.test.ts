import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  FragranceLine,
} from "@/lib/lineage/types";

describe("Lineage Workspace contract", () => {
  it("supports chronology, active branches, and evolution summaries", () => {
    const line: FragranceLine = {
      id: "line-test",
      canonicalName: "Test",
      brandId: "brand-test",
      originalFragranceId: "test-edt",
      members: [],
      chronology: [
        "test-edt",
        "test-edp",
        "test-parfum",
      ],
      activeMemberIds: [
        "test-edt",
        "test-edp",
      ],
      discontinuedMemberIds: [
        "test-parfum",
      ],
      averageInheritance: 82,
      averageEvolution: 31,
      confidence: 95,
    };

    expect(
      line.chronology,
    ).toHaveLength(3);
    expect(
      line.activeMemberIds,
    ).toHaveLength(2);
    expect(
      line.averageInheritance,
    ).toBe(82);
  });
});
