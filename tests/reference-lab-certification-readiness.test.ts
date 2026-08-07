import {
  describe,
  expect,
  it,
} from "vitest";
import {
  evaluateReferenceCertificationReadiness,
} from "@/lib/reference-lab/certification-engine";

describe("Reference Laboratory certification readiness", () => {
  it("blocks certification when reviewer coverage and calibration coverage are insufficient", () => {
    const readiness =
      evaluateReferenceCertificationReadiness({
        version: {
          versionId:
            "version:1",
          sessionId:
            "session:1",
          fragranceId:
            "house:scent",
          version:
            "1.0.0",
          status:
            "validated",
          createdAt:
            "2026-08-07T00:00:00.000Z",
          createdBy:
            "reviewer:a",
        },
        run: {
          runId:
            "run:1",
          fragranceId:
            "house:scent",
          versionId:
            "version:1",
          sourcePackageIds: [
            "package:a",
          ],
          sourceSubmissionIds: [
            "submission:a",
          ],
          reviewerIds: [
            "reviewer:a",
          ],
          generatedAt:
            "2026-08-07T01:00:00.000Z",
          thresholds: {
            lowMaxRange: 8,
            moderateMaxRange: 18,
            minimumReviewerCount: 2,
          },
          snapshot: {
            consensusId:
              "consensus:1",
            sessionId:
              "session:1",
            fragranceId:
              "house:scent",
            versionId:
              "version:1",
            generatedAt:
              "2026-08-07T01:00:00.000Z",
            metrics: [],
            averageConfidence: 95,
            unresolvedConflictCount: 0,
          },
          conflicts: [],
        },
        packages: [],
        certifier: {
          reviewerId:
            "reviewer:admin",
          displayName:
            "Admin",
          role:
            "administrator",
          active: true,
        },
      });

    expect(
      readiness.eligible,
    ).toBe(false);

    expect(
      readiness.blockers
        .join(" "),
    ).toContain(
      "Reviewer coverage",
    );

    expect(
      readiness.blockers
        .join(" "),
    ).toContain(
      "Calibration coverage",
    );
  });
});
