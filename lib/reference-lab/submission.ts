import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import type {
  ReferenceReviewerSubmission,
} from "@/lib/reference-lab/types";
import type {
  ReferenceWorkspaceDraft,
} from "@/lib/reference-lab/workspace";
import {
  materializeReferenceWorkspace,
} from "@/lib/reference-lab/workspace";
import {
  createReferenceReviewPackage,
} from "@/lib/reference-lab/review-workflow";

export function createReviewPackageFromWorkspace({
  draft,
  timestamp,
}: {
  draft:
    ReferenceWorkspaceDraft;
  timestamp: string;
}) {
  if (
    draft.status !==
    "review"
  ) {
    throw new Error(
      "Only submitted Reference Laboratory workspaces can become review packages.",
    );
  }

  const materialized =
    materializeReferenceWorkspace({
      draft,
      timestamp,
    });

  const submission:
    ReferenceReviewerSubmission = {
    submissionId:
      createReferenceLabId(
        "ref-submission",
        [
          draft.fragranceId,
          draft.calibrationVersion,
          draft.reviewerId,
        ],
      ),
    sessionId:
      draft.sessionId,
    fragranceId:
      draft.fragranceId,
    versionId:
      draft.versionId,
    reviewerId:
      draft.reviewerId,
    claimIds:
      materialized.claims.map(
        (claim) =>
          claim.claimId,
      ),
    submittedAt:
      timestamp,
  };

  return createReferenceReviewPackage({
    submission,
    claims:
      materialized.claims,
    evidence:
      materialized.evidence,
    timestamp,
  });
}
