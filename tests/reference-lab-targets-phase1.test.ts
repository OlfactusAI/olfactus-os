import {
  describe,
  expect,
  it,
} from "vitest";
import {
  referenceCalibrationTargetsPhase1,
} from "@/lib/reference-lab/reference-targets";

describe("Reference Calibration Phase I targets", () => {
  it("contains exactly 25 calibration targets without pre-calibrated scores", () => {
    expect(
      referenceCalibrationTargetsPhase1,
    ).toHaveLength(25);

    expect(
      referenceCalibrationTargetsPhase1.every(
        (target) =>
          target.fragranceId.length >
            0 &&
          target.brand.length >
            0 &&
          target.name.length >
            0,
      ),
    ).toBe(true);
  });
});
