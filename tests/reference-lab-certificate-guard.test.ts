import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createCalibrationVersion,
  createGoldStandardCertificate,
} from "@/lib/reference-lab";

describe("Gold Standard certificate guardrails", () => {
  it("refuses to certify an unlocked non-gold calibration version", () => {
    const version =
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
      });

    expect(
      () =>
        createGoldStandardCertificate({
          version,
          consensus: {
            consensusId:
              "consensus:1",
            sessionId:
              version.sessionId,
            fragranceId:
              version.fragranceId,
            versionId:
              version.versionId,
            generatedAt:
              "2026-08-07T01:00:00.000Z",
            metrics: [],
            averageConfidence: 95,
            unresolvedConflictCount: 0,
          },
          issuedBy:
            "reviewer:admin",
          issuedAt:
            "2026-08-07T02:00:00.000Z",
          referenceQuality: 98,
          evidenceCompleteness: 100,
        }),
    ).toThrow(
      "gold-standard",
    );
  });
});
