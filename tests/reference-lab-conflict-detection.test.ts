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

function pkg(
  reviewerId: string,
  value: number,
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
          "season",
        metric:
          "summer",
        value,
        confidence: 90,
        rationale:
          "Independent evidence.",
        evidenceIds: [],
        createdAt:
          "2026-08-07T00:00:00.000Z",
        updatedAt:
          "2026-08-07T00:00:00.000Z",
      },
    ],
    evidence: [],
    reviews: [],
    state:
      "approved",
    createdAt:
      "2026-08-07T00:00:00.000Z",
    updatedAt:
      "2026-08-07T01:00:00.000Z",
  };
}

describe("Reference Laboratory conflict detection", () => {
  it("creates an unresolved conflict for material reviewer disagreement", () => {
    const run =
      buildReferenceConsensus({
        packages: [
          pkg(
            "reviewer:a",
            90,
          ),
          pkg(
            "reviewer:b",
            60,
          ),
        ],
        fragranceId:
          "house:scent",
        versionId:
          "version:1",
        timestamp:
          "2026-08-07T02:00:00.000Z",
      });

    expect(
      run.snapshot.metrics[0]
        ?.conflict,
    ).toBe(
      "moderate",
    );

    expect(
      run.conflicts,
    ).toHaveLength(1);

    expect(
      run.snapshot
        .unresolvedConflictCount,
    ).toBe(1);

    expect(
      run.conflicts[0]
        ?.status,
    ).toBe(
      "open",
    );
  });
});
