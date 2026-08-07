import {
  calculateReferenceWorkspaceCompleteness,
  claimKey,
  updateReferenceWorkspaceClaim,
  type ReferenceWorkspaceDraft,
} from "@/lib/reference-lab/workspace";
import {
  referenceCalibrationSections,
} from "@/lib/reference-lab/workspace-schema";
import type {
  GoldStandardDatasetBuildState,
} from "@/lib/gold-standard-builder/types";

export interface ReviewerAuthoringProgress {
  reviewerId: string;
  scored: number;
  evidenced: number;
  confidenceReady: number;
  required: number;
  complete: boolean;
  sections: Array<{
    sectionId: string;
    title: string;
    complete: number;
    total: number;
  }>;
  missing: string[];
}

export function getReviewerAuthoringProgress(
  draft:
    ReferenceWorkspaceDraft,
): ReviewerAuthoringProgress {
  const completeness =
    calculateReferenceWorkspaceCompleteness(
      draft,
    );

  const sections =
    referenceCalibrationSections.map(
      (section) => {
        const complete =
          section.metrics.filter(
            (metric) => {
              const claim =
                draft.claims[
                  claimKey(
                    metric.domain,
                    metric.metric,
                  )
                ];

              return Boolean(
                claim &&
                typeof claim.value ===
                  "number" &&
                typeof claim.confidence ===
                  "number" &&
                claim.rationale.trim() &&
                claim.evidence.trim(),
              );
            },
          ).length;

        return {
          sectionId:
            section.id,
          title:
            section.title,
          complete,
          total:
            section.metrics.length,
        };
      },
    );

  const missing =
    referenceCalibrationSections.flatMap(
      (section) =>
        section.metrics.flatMap(
          (metric) => {
            const claim =
              draft.claims[
                claimKey(
                  metric.domain,
                  metric.metric,
                )
              ];

            const missingFields:
              string[] = [];

            if (
              typeof claim
                ?.value !==
              "number"
            ) {
              missingFields.push(
                "score",
              );
            }

            if (
              typeof claim
                ?.confidence !==
              "number"
            ) {
              missingFields.push(
                "confidence",
              );
            }

            if (
              !claim
                ?.rationale
                .trim()
            ) {
              missingFields.push(
                "rationale",
              );
            }

            if (
              !claim
                ?.evidence
                .trim()
            ) {
              missingFields.push(
                "evidence",
              );
            }

            return missingFields.length
              ? [
                  `${section.title} → ${metric.label}: ${missingFields.join(", ")}`,
                ]
              : [];
          },
        ),
    );

  return {
    reviewerId:
      draft.reviewerId,
    scored:
      completeness.scored,
    evidenced:
      completeness.evidenced,
    confidenceReady:
      completeness.confidenceReady,
    required:
      completeness.required,
    complete:
      completeness.readyForReview,
    sections,
    missing,
  };
}

export function updateDatasetReviewerClaim({
  state,
  reviewerId,
  domain,
  metric,
  patch,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  reviewerId: string;
  domain: string;
  metric: string;
  patch:
    Parameters<
      typeof updateReferenceWorkspaceClaim
    >[0]["patch"];
  timestamp: string;
}) {
  const reviewerDrafts =
    state.reviewerDrafts.map(
      (draft) =>
        draft.reviewerId ===
        reviewerId
          ? updateReferenceWorkspaceClaim({
              draft,
              domain,
              metric,
              patch,
              timestamp,
            })
          : draft,
    );

  return {
    ...state,
    reviewerDrafts,
  };
}

export function getDatasetAuthoringReadiness(
  state:
    GoldStandardDatasetBuildState,
) {
  const reviewers =
    state.reviewerDrafts.map(
      getReviewerAuthoringProgress,
    );

  const reviewerIds =
    new Set(
      state.reviewerDrafts.map(
        (draft) =>
          draft.reviewerId,
      ),
    );

  return {
    reviewerCount:
      reviewerIds.size,
    reviewers,
    independent:
      reviewerIds.size ===
      state.reviewerDrafts.length,
    allComplete:
      reviewers.length >=
        2 &&
      reviewers.every(
        (reviewer) =>
          reviewer.complete,
      ),
    totalRequired:
      reviewers.reduce(
        (
          total,
          reviewer,
        ) =>
          total +
          reviewer.required,
        0,
      ),
    totalComplete:
      reviewers.reduce(
        (
          total,
          reviewer,
        ) =>
          total +
          Math.min(
            reviewer.scored,
            reviewer.evidenced,
            reviewer.confidenceReady,
          ),
        0,
      ),
  };
}
