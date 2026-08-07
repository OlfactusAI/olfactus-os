import {
  reviewProgress,
  reviewReferenceClaim,
} from "@/lib/reference-lab/review-workflow";
import type {
  GoldStandardDatasetBuildState,
} from "@/lib/gold-standard-builder/types";

export function getDatasetReviewReadiness(
  state:
    GoldStandardDatasetBuildState,
) {
  const packages =
    state.reviewPackages;

  const packageSummaries =
    packages.map(
      (reviewPackage) => ({
        packageId:
          reviewPackage.packageId,
        reviewerId:
          reviewPackage.submission
            .reviewerId,
        state:
          reviewPackage.state,
        progress:
          reviewProgress(
            reviewPackage,
          ),
      }),
    );

  return {
    submitted:
      packages.length >=
      2,
    allApproved:
      packages.length >=
        2 &&
      packages.every(
        (reviewPackage) =>
          reviewPackage.state ===
          "approved",
      ),
    blocked:
      packages.some(
        (reviewPackage) =>
          reviewPackage.state ===
            "rejected" ||
          reviewPackage.state ===
            "revision-requested",
      ),
    packageSummaries,
  };
}

export function applyDatasetClaimReview({
  state,
  packageId,
  claimId,
  reviewerId,
  decision,
  note,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  packageId: string;
  claimId: string;
  reviewerId: string;
  decision:
    | "approved"
    | "revision-requested"
    | "rejected";
  note: string;
  timestamp: string;
}) {
  const reviewPackages =
    state.reviewPackages.map(
      (reviewPackage) =>
        reviewPackage.packageId ===
        packageId
          ? reviewReferenceClaim({
              package:
                reviewPackage,
              claimId,
              reviewerId,
              decision,
              note,
              timestamp,
            })
          : reviewPackage,
    );

  return {
    ...state,
    reviewPackages,
  };
}
