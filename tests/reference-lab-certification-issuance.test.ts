import {
  describe,
  expect,
  it,
} from "vitest";
import {
  issueReferenceGoldStandardCertification,
} from "@/lib/reference-lab/certification-engine";
import {
  requiredCalibrationMetricCount,
} from "@/lib/reference-lab/workspace-schema";

function metric(
  index: number,
) {
  return {
    domain:
      "dna" as const,
    metric:
      `metric-${index}`,
    value: 90,
    confidence: 95,
    reviewerCount: 2,
    variance: 1,
    conflict:
      "none" as const,
    supportingClaimIds: [
      `claim:a:${index}`,
      `claim:b:${index}`,
    ],
  };
}

describe("Reference Laboratory Gold Standard issuance", () => {
  it("locks the version, issues an auditable certificate, and queues production review", () => {
    const metrics =
      Array.from(
        {
          length:
            requiredCalibrationMetricCount,
        },
        (
          _,
          index,
        ) =>
          metric(
            index,
          ),
      );

    const packages =
      [
        "a",
        "b",
      ].map(
        (suffix) => ({
          packageId:
            `package:${suffix}`,
          submission: {
            submissionId:
              `submission:${suffix}`,
            fragranceId:
              "house:scent",
            versionId:
              "version:1",
            reviewerId:
              `reviewer:${suffix}`,
          },
          claims:
            metrics.map(
              (
                _,
                index,
              ) => ({
                claimId:
                  `claim:${suffix}:${index}`,
                evidenceIds: [
                  `evidence:${suffix}:${index}`,
                ],
              }),
            ),
          evidence:
            metrics.map(
              (
                _,
                index,
              ) => ({
                evidenceId:
                  `evidence:${suffix}:${index}`,
              }),
            ),
          state:
            "approved",
        }),
      );

    const result =
      issueReferenceGoldStandardCertification({
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
            "package:b",
          ],
          sourceSubmissionIds: [
            "submission:a",
            "submission:b",
          ],
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
            metrics,
            averageConfidence: 95,
            unresolvedConflictCount: 0,
          },
          conflicts: [],
        },
        packages,
        certifier: {
          reviewerId:
            "reviewer:admin",
          displayName:
            "Reference Administrator",
          role:
            "administrator",
          active: true,
        },
        issuedAt:
          "2026-08-07T02:00:00.000Z",
      });

    expect(
      result.version.status,
    ).toBe(
      "gold-standard",
    );

    expect(
      result.version.lockedAt,
    ).toBe(
      "2026-08-07T02:00:00.000Z",
    );

    expect(
      result.certificate.locked,
    ).toBe(true);

    expect(
      result.certificate.certificateHash,
    ).toMatch(
      /^gs1-/,
    );

    expect(
      result.audit.certificateHash,
    ).toBe(
      result.certificate.certificateHash,
    );

    expect(
      result.promotionQueueItem.status,
    ).toBe(
      "certified",
    );

    expect(
      result.promotionQueueItem.blockers
        .join(" "),
    ).toContain(
      "not automatically active in NRE",
    );
  });
});
