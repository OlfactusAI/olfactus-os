import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createReferenceReviewPackage,
} from "@/lib/reference-lab/review-workflow";

describe("Reference Laboratory review packages", () => {
  it("includes only claims and evidence referenced by the submission", () => {
    const packageResult =
      createReferenceReviewPackage({
        submission: {
          submissionId:
            "submission:1",
          sessionId:
            "session:1",
          fragranceId:
            "house:scent",
          versionId:
            "version:1",
          reviewerId:
            "reviewer:a",
          claimIds: [
            "claim:1",
          ],
          submittedAt:
            "2026-08-07T00:00:00.000Z",
        },
        claims: [
          {
            claimId:
              "claim:1",
            sessionId:
              "session:1",
            fragranceId:
              "house:scent",
            versionId:
              "version:1",
            reviewerId:
              "reviewer:a",
            domain:
              "performance",
            metric:
              "projection",
            value: 80,
            confidence: 90,
            rationale:
              "Rationale",
            evidenceIds: [
              "evidence:1",
            ],
            createdAt:
              "2026-08-07T00:00:00.000Z",
            updatedAt:
              "2026-08-07T00:00:00.000Z",
          },
          {
            claimId:
              "claim:2",
            sessionId:
              "session:1",
            fragranceId:
              "house:scent",
            versionId:
              "version:1",
            reviewerId:
              "reviewer:a",
            domain:
              "performance",
            metric:
              "sillage",
            value: 70,
            confidence: 80,
            rationale:
              "Other",
            evidenceIds: [
              "evidence:2",
            ],
            createdAt:
              "2026-08-07T00:00:00.000Z",
            updatedAt:
              "2026-08-07T00:00:00.000Z",
          },
        ],
        evidence: [
          {
            evidenceId:
              "evidence:1",
            label:
              "Projection",
            method:
              "curated-review",
            detail:
              "Evidence 1",
            confidence: 90,
            capturedAt:
              "2026-08-07T00:00:00.000Z",
            capturedBy:
              "reviewer:a",
          },
          {
            evidenceId:
              "evidence:2",
            label:
              "Sillage",
            method:
              "curated-review",
            detail:
              "Evidence 2",
            confidence: 80,
            capturedAt:
              "2026-08-07T00:00:00.000Z",
            capturedBy:
              "reviewer:a",
          },
        ],
        timestamp:
          "2026-08-07T00:01:00.000Z",
      });

    expect(
      packageResult.claims,
    ).toHaveLength(1);
    expect(
      packageResult.evidence,
    ).toHaveLength(1);
    expect(
      packageResult.state,
    ).toBe(
      "submitted",
    );
  });
});
