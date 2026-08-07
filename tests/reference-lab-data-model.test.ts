import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createReferenceCalibrationSession,
  createReferenceLabRepository,
} from "@/lib/reference-lab";

describe("Reference Laboratory data model", () => {
  it("creates a deterministic calibration session and initial version", () => {
    const created =
      createReferenceCalibrationSession({
        fragranceId:
          "creed:aventus",
        brand:
          "Creed",
        name:
          "Aventus",
        createdBy:
          "reviewer:steve",
        createdAt:
          "2026-08-07T22:30:00.000Z",
      });

    expect(
      created.session.sessionId,
    ).toBe(
      "ref-session:creed-aventus",
    );

    expect(
      created.version.versionId,
    ).toBe(
      "ref-version:creed-aventus:1-0-0",
    );

    expect(
      created.session.activeVersionId,
    ).toBe(
      created.version.versionId,
    );

    const repository =
      createReferenceLabRepository();

    repository.saveSession(
      created.session,
    );
    repository.saveVersion(
      created.version,
    );

    expect(
      repository.snapshot(
        created.session.sessionId,
      )?.versions,
    ).toHaveLength(1);
  });
});
