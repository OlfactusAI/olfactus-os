import {
  describe,
  expect,
  it,
} from "vitest";
import {
  reviewReferenceClaim,
} from "@/lib/reference-lab/review-workflow";
import type {
  ReferenceReviewPackage,
} from "@/lib/reference-lab/review-types";

const reviewPackage:
  ReferenceReviewPackage = {
    packageId:
      "package:1",
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
      "submitted",
    createdAt:
      "2026-08-07T00:00:00.000Z",
    updatedAt:
      "2026-08-07T00:00:00.000Z",
  };

describe("Reference Laboratory reviewer guardrails", () => {
  it("prevents self-review", () => {
    expect(
      () =>
        reviewReferenceClaim({
          package:
            reviewPackage,
          claimId:
            "claim:1",
          reviewerId:
            "reviewer:a",
          decision:
            "approved",
          note: "",
          timestamp:
            "2026-08-07T00:02:00.000Z",
        }),
    ).toThrow(
      "own calibration submission",
    );
  });

  it("requires notes for revision and rejection", () => {
    expect(
      () =>
        reviewReferenceClaim({
          package:
            reviewPackage,
          claimId:
            "claim:1",
          reviewerId:
            "reviewer:b",
          decision:
            "revision-requested",
          note: "",
          timestamp:
            "2026-08-07T00:02:00.000Z",
        }),
    ).toThrow(
      "require a reviewer note",
    );
  });
});
