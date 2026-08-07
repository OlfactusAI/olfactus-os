import type {
  ReferenceClaim,
  ReferenceEvidenceLink,
  ReferenceReviewerSubmission,
} from "@/lib/reference-lab/types";

export type ReferenceReviewDecision =
  | "pending"
  | "approved"
  | "revision-requested"
  | "rejected";

export interface ReferenceClaimReview {
  reviewId: string;
  submissionId: string;
  claimId: string;
  reviewerId: string;
  decision:
    ReferenceReviewDecision;
  note: string;
  reviewedAt?: string;
}

export interface ReferenceReviewPackage {
  packageId: string;
  submission:
    ReferenceReviewerSubmission;
  claims:
    ReferenceClaim[];
  evidence:
    ReferenceEvidenceLink[];
  reviews:
    ReferenceClaimReview[];
  state:
    | "submitted"
    | "under-review"
    | "approved"
    | "revision-requested"
    | "rejected";
  createdAt: string;
  updatedAt: string;
}
