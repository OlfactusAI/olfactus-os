import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createReferenceCalibrationSession,
  createReferenceLabRepository,
} from "@/lib/reference-lab";

describe("Reference Laboratory snapshot", () => {
  it("returns session-scoped evidence and claims without cross-session leakage", () => {
    const repository =
      createReferenceLabRepository();

    const created =
      createReferenceCalibrationSession({
        fragranceId:
          "creed:aventus",
        brand:
          "Creed",
        name:
          "Aventus",
        createdBy:
          "reviewer:a",
        createdAt:
          "2026-08-07T00:00:00.000Z",
      });

    repository.saveSession(
      created.session,
    );
    repository.saveVersion(
      created.version,
    );

    repository.saveEvidence({
      evidenceId:
        "evidence:official",
      label:
        "Official source",
      method:
        "official-source",
      detail:
        "Official concentration and composition description.",
      sourceUrl:
        "https://example.com",
      confidence: 99,
      capturedAt:
        "2026-08-07T00:01:00.000Z",
      capturedBy:
        "reviewer:a",
    });

    repository.saveClaim({
      claimId:
        "claim:projection",
      sessionId:
        created.session.sessionId,
      fragranceId:
        created.session.fragranceId,
      versionId:
        created.version.versionId,
      reviewerId:
        "reviewer:a",
      domain:
        "performance",
      metric:
        "projection",
      value: 84,
      confidence: 91,
      rationale:
        "Reference calibration.",
      evidenceIds: [
        "evidence:official",
      ],
      createdAt:
        "2026-08-07T00:02:00.000Z",
      updatedAt:
        "2026-08-07T00:02:00.000Z",
    });

    const snapshot =
      repository.snapshot(
        created.session.sessionId,
      );

    expect(
      snapshot?.claims,
    ).toHaveLength(1);

    expect(
      snapshot?.evidence,
    ).toHaveLength(1);
  });
});
