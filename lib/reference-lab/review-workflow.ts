import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import type {
  ReferenceClaim,
  ReferenceEvidenceLink,
  ReferenceReviewerSubmission,
} from "@/lib/reference-lab/types";
import type {
  ReferenceClaimReview,
  ReferenceReviewDecision,
  ReferenceReviewPackage,
} from "@/lib/reference-lab/review-types";

export function createReferenceReviewPackage({
  submission,
  claims,
  evidence,
  timestamp,
}: {
  submission:
    ReferenceReviewerSubmission;
  claims:
    ReferenceClaim[];
  evidence:
    ReferenceEvidenceLink[];
  timestamp: string;
}): ReferenceReviewPackage {
  const submissionClaims =
    claims.filter(
      (claim) =>
        submission.claimIds.includes(
          claim.claimId,
        ),
    );

  const evidenceIds =
    new Set(
      submissionClaims.flatMap(
        (claim) =>
          claim.evidenceIds,
      ),
    );

  const submissionEvidence =
    evidence.filter(
      (item) =>
        evidenceIds.has(
          item.evidenceId,
        ),
    );

  return {
    packageId:
      createReferenceLabId(
        "ref-review-package",
        [
          submission.submissionId,
        ],
      ),
    submission,
    claims:
      submissionClaims,
    evidence:
      submissionEvidence,
    reviews: [],
    state:
      "submitted",
    createdAt:
      timestamp,
    updatedAt:
      timestamp,
  };
}

export function reviewReferenceClaim({
  package: reviewPackage,
  claimId,
  reviewerId,
  decision,
  note,
  timestamp,
}: {
  package:
    ReferenceReviewPackage;
  claimId: string;
  reviewerId: string;
  decision:
    Exclude<
      ReferenceReviewDecision,
      "pending"
    >;
  note: string;
  timestamp: string;
}): ReferenceReviewPackage {
  if (
    !reviewPackage.claims.some(
      (claim) =>
        claim.claimId ===
        claimId,
    )
  ) {
    throw new Error(
      "Claim does not belong to this review package.",
    );
  }

  if (
    reviewerId ===
    reviewPackage.submission
      .reviewerId
  ) {
    throw new Error(
      "A reviewer cannot approve or reject their own calibration submission.",
    );
  }

  if (
    (
      decision ===
        "revision-requested" ||
      decision ===
        "rejected"
    ) &&
    !note.trim()
  ) {
    throw new Error(
      "Revision and rejection decisions require a reviewer note.",
    );
  }

  const reviewId =
    createReferenceLabId(
      "ref-claim-review",
      [
        reviewPackage
          .submission
          .submissionId,
        claimId,
        reviewerId,
      ],
    );

  const nextReview:
    ReferenceClaimReview = {
      reviewId,
      submissionId:
        reviewPackage
          .submission
          .submissionId,
      claimId,
      reviewerId,
      decision,
      note:
        note.trim(),
      reviewedAt:
        timestamp,
    };

  const reviews = [
    ...reviewPackage.reviews.filter(
      (review) =>
        !(
          review.claimId ===
            claimId &&
          review.reviewerId ===
            reviewerId
        ),
    ),
    nextReview,
  ];

  return {
    ...reviewPackage,
    reviews,
    state:
      derivePackageState({
        claims:
          reviewPackage
            .claims,
        reviews,
      }),
    updatedAt:
      timestamp,
  };
}

export function derivePackageState({
  claims,
  reviews,
}: {
  claims:
    ReferenceClaim[];
  reviews:
    ReferenceClaimReview[];
}): ReferenceReviewPackage["state"] {
  if (
    reviews.some(
      (review) =>
        review.decision ===
        "rejected",
    )
  ) {
    return "rejected";
  }

  if (
    reviews.some(
      (review) =>
        review.decision ===
        "revision-requested",
    )
  ) {
    return "revision-requested";
  }

  const approvedClaimIds =
    new Set(
      reviews
        .filter(
          (review) =>
            review.decision ===
            "approved",
        )
        .map(
          (review) =>
            review.claimId,
        ),
    );

  if (
    claims.length >
      0 &&
    claims.every(
      (claim) =>
        approvedClaimIds.has(
          claim.claimId,
        ),
    )
  ) {
    return "approved";
  }

  return reviews.length >
    0
    ? "under-review"
    : "submitted";
}

export function reviewProgress(
  reviewPackage:
    ReferenceReviewPackage,
) {
  const claimIds =
    new Set(
      reviewPackage.claims.map(
        (claim) =>
          claim.claimId,
      ),
    );

  const latestDecisions =
    new Map<
      string,
      ReferenceClaimReview
    >();

  for (
    const review
    of reviewPackage.reviews
  ) {
    if (
      claimIds.has(
        review.claimId,
      )
    ) {
      latestDecisions.set(
        review.claimId,
        review,
      );
    }
  }

  return {
    total:
      reviewPackage
        .claims.length,
    reviewed:
      latestDecisions.size,
    approved:
      [
        ...latestDecisions
          .values(),
      ].filter(
        (review) =>
          review.decision ===
          "approved",
      ).length,
    revisions:
      [
        ...latestDecisions
          .values(),
      ].filter(
        (review) =>
          review.decision ===
          "revision-requested",
      ).length,
    rejected:
      [
        ...latestDecisions
          .values(),
      ].filter(
        (review) =>
          review.decision ===
          "rejected",
      ).length,
  };
}
