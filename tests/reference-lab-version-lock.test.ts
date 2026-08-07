import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createCalibrationVersion,
  createReferenceLabRepository,
  lockCalibrationVersion,
} from "@/lib/reference-lab";

describe("Reference Laboratory version locking", () => {
  it("prevents new calibration claims from being written to a locked version", () => {
    const repository =
      createReferenceLabRepository();

    const version =
      lockCalibrationVersion({
        version:
          createCalibrationVersion({
            sessionId:
              "ref-session:test",
            fragranceId:
              "house:scent",
            version:
              "1.0.0",
            createdBy:
              "reviewer:a",
            createdAt:
              "2026-08-07T00:00:00.000Z",
          }),
        lockedBy:
          "reviewer:admin",
        lockedAt:
          "2026-08-07T01:00:00.000Z",
      });

    repository.saveVersion(
      version,
    );

    expect(
      () =>
        repository.saveClaim({
          claimId:
            "claim:1",
          sessionId:
            version.sessionId,
          fragranceId:
            version.fragranceId,
          versionId:
            version.versionId,
          reviewerId:
            "reviewer:a",
          domain:
            "performance",
          metric:
            "projection",
          value: 85,
          confidence: 90,
          rationale:
            "Calibrated evidence.",
          evidenceIds: [],
          createdAt:
            "2026-08-07T01:01:00.000Z",
          updatedAt:
            "2026-08-07T01:01:00.000Z",
        }),
    ).toThrow(
      "locked",
    );
  });
});
