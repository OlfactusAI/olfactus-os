import {
  describe,
  expect,
  it,
} from "vitest";
import {
  firstLiveReferenceTarget,
} from "@/lib/reference-live/aventus";

describe("First live Gold Standard reference target", () => {
  it("is Creed Aventus and contains no invented calibration scores", () => {
    expect(
      firstLiveReferenceTarget,
    ).toEqual({
      fragranceId:
        "creed:aventus",
      brand:
        "Creed",
      name:
        "Aventus",
    });

    expect(
      "scores" in
      firstLiveReferenceTarget,
    ).toBe(false);
  });
});
