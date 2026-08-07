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

function packageWithState(
  reviewerId: string,
  state:
    ReferenceReviewPackage["state"],
): ReferenceReviewPackage {
  const claimId =
    `claim:${reviewerId}`;

  return {
    packageId:
      `package:${reviewerId}`,
    submission: {
      submissionId:
        `submission:${reviewerId}`,
      sessionId:
        "session:1",
      fragranceId:
        "house:scent",
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
          "house:scent",
        versionId:
          "version:1",
        reviewerId,
        domain:
          "performance",
        metric:
          "projection",
        value: 80,
        confidence: 90,
        rationale:
          "Calibration.",
        evidenceIds: [],
        createdAt:
          "2026-08-07T00:00:00.000Z",
        updatedAt:
          "2026-08-07T00:00:00.000Z",
      },
    ],
    evidence: [],
    reviews: [],
    state,
    createdAt:
      "2026-08-07T00:00:00.000Z",
    updatedAt:
      "2026-08-07T00:00:00.000Z",
  };
}

describe("Reference Laboratory consensus filtering", () => {
  it("excludes revision and rejected packages from consensus input", () => {
    expect(
      () =>
        buildReferenceConsensus({
          packages: [
            packageWithState(
              "reviewer:a",
              "approved",
            ),
            packageWithState(
              "reviewer:b",
              "revision-requested",
            ),
            packageWithState(
              "reviewer:c",
              "rejected",
            ),
          ],
          fragranceId:
            "house:scent",
          versionId:
            "version:1",
          timestamp:
            "2026-08-07T02:00:00.000Z",
        }),
    ).toThrow(
      "at least 2",
    );
  });
});
