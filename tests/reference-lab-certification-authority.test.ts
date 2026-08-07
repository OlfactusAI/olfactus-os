import {
  describe,
  expect,
  it,
} from "vitest";
import {
  evaluateReferenceCertificationReadiness,
} from "@/lib/reference-lab/certification-engine";

describe("Reference Laboratory certification authority", () => {
  it("requires an active administrator", () => {
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
          sourcePackageIds: [],
          sourceSubmissionIds: [],
          reviewerIds: [
            "reviewer:a",
            "reviewer:b",
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
            "reviewer:not-admin",
          displayName:
            "Reviewer",
          role:
            "reviewer",
          active: true,
        },
      });

    expect(
      readiness.blockers
        .join(" "),
    ).toContain(
      "administrator",
    );
  });
});
