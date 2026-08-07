import {
  describe,
  expect,
  it,
} from "vitest";
import {
  buildReferenceConsensus,
} from "@/lib/reference-lab/consensus-engine";
import type {
  ReferenceReviewPackage,
} from "@/lib/reference-lab/review-types";

function approvedPackage({
  packageId,
  reviewerId,
  value,
  confidence,
}: {
  packageId: string;
  reviewerId: string;
  value: number;
  confidence: number;
}): ReferenceReviewPackage {
  const claimId =
    `claim:${reviewerId}`;

  return {
    packageId,
    submission: {
      submissionId:
        `submission:${reviewerId}`,
      sessionId:
        "session:1",
      fragranceId:
        "creed:aventus",
      versionId:
        "version:1",
      reviewerId,
      claimIds: [
        claimId,
      ],
      submittedAt:
        "2026-08-07T00:00:00.000Z",
    },
    claims: [
      {
        claimId,
        sessionId:
          "session:1",
        fragranceId:
          "creed:aventus",
        versionId:
          "version:1",
        reviewerId,
        domain:
          "performance",
        metric:
          "projection",
        value,
        confidence,
        rationale:
          "Independent calibration.",
        evidenceIds: [],
        createdAt:
          "2026-08-07T00:00:00.000Z",
        updatedAt:
          "2026-08-07T00:00:00.000Z",
      },
    ],
    evidence: [],
    reviews: [
      {
        reviewId:
          `review:${reviewerId}`,
        submissionId:
          `submission:${reviewerId}`,
        claimId,
        reviewerId:
          `reviewer:external-${reviewerId}`,
        decision:
          "approved",
        note: "",
        reviewedAt:
          "2026-08-07T01:00:00.000Z",
      },
    ],
    state:
      "approved",
    createdAt:
      "2026-08-07T00:00:00.000Z",
    updatedAt:
      "2026-08-07T01:00:00.000Z",
  };
}

describe("Reference Laboratory consensus engine", () => {
  it("calculates a confidence-weighted consensus from independent approved submissions", () => {
    const run =
      buildReferenceConsensus({
        packages: [
          approvedPackage({
            packageId:
              "package:a",
            reviewerId:
              "reviewer:a",
            value: 80,
            confidence: 90,
          }),
          approvedPackage({
            packageId:
              "package:b",
            reviewerId:
              "reviewer:b",
            value: 84,
            confidence: 100,
          }),
        ],
        fragranceId:
          "creed:aventus",
        versionId:
          "version:1",
        timestamp:
          "2026-08-07T02:00:00.000Z",
      });

    expect(
      run.reviewerIds,
    ).toHaveLength(2);

    expect(
      run.snapshot.metrics,
    ).toHaveLength(1);

    expect(
      run.snapshot.metrics[0]
        ?.value,
    ).toBeCloseTo(
      82.1,
      1,
    );

    expect(
      run.snapshot.metrics[0]
        ?.conflict,
    ).toBe(
      "none",
    );

    expect(
      run.conflicts,
    ).toHaveLength(0);
  });
});
