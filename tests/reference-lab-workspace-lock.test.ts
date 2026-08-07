import {
  describe,
  expect,
  it,
} from "vitest";
import {
  referenceCalibrationTargetsPhase1,
} from "@/lib/reference-lab/reference-targets";
import {
  createReferenceWorkspaceDraft,
  updateReferenceWorkspaceClaim,
} from "@/lib/reference-lab/workspace";

describe("Reference Laboratory workspace locking", () => {
  it("blocks edits when a calibration workspace is locked", () => {
    const draft = {
      ...createReferenceWorkspaceDraft({
        target:
          referenceCalibrationTargetsPhase1[0]!,
        reviewerId:
          "reviewer:test",
        timestamp:
          "2026-08-07T00:00:00.000Z",
      }),
      locked: true,
    };

    expect(
      () =>
        updateReferenceWorkspaceClaim({
          draft,
          domain:
            "dna",
          metric:
            "freshness",
          patch: {
            value: 90,
          },
          timestamp:
            "2026-08-07T00:01:00.000Z",
        }),
    ).toThrow(
      "read-only",
    );
  });
});
