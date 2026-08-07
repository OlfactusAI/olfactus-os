import type {
  GoldStandardDatasetBuildState,
  GoldStandardDatasetReviewer,
  GoldStandardDatasetStage,
  GoldStandardDatasetTarget,
} from "@/lib/gold-standard-builder/types";
import {
  createReferenceWorkspaceDraft,
  submitReferenceWorkspaceForReview,
} from "@/lib/reference-lab/workspace";
import {
  createReviewPackageFromWorkspace,
} from "@/lib/reference-lab/submission";
import {
  reviewReferenceClaim,
} from "@/lib/reference-lab/review-workflow";
import {
  buildReferenceConsensus,
} from "@/lib/reference-lab/consensus-engine";
import {
  issueReferenceGoldStandardCertification,
} from "@/lib/reference-lab/certification-engine";
import {
  registerCertifiedReference,
  updateRegistryCoverage,
} from "@/lib/reference-registry/registry";
import {
  buildProductionFingerprintBundle,
} from "@/lib/production-fingerprints/builder";
import {
  synchronizeRegistryCoverageFromFingerprints,
} from "@/lib/production-fingerprints/coverage";
import {
  createProductionPromotionPackage,
  approveProductionPromotion,
  createProductionActivationPackage,
} from "@/lib/production-pipeline/pipeline";
import {
  activateProductionReference,
} from "@/lib/production-activation/bridge";
import type {
  ReferenceReviewer,
} from "@/lib/reference-lab/types";

export function createGoldStandardDatasetState({
  target,
  reviewers,
  timestamp,
}: {
  target:
    GoldStandardDatasetTarget;
  reviewers:
    GoldStandardDatasetReviewer[];
  timestamp: string;
}): GoldStandardDatasetBuildState {
  if (
    reviewers.length <
    2
  ) {
    throw new Error(
      "Gold Standard dataset building requires at least two independent reviewers.",
    );
  }

  return {
    target,
    reviewerDrafts:
      reviewers.map(
        (reviewer) =>
          createReferenceWorkspaceDraft({
            target: {
              fragranceId:
                target.fragranceId,
              brand:
                target.brand,
              name:
                target.name,
              phase: 1,
            },
            reviewerId:
              reviewer.reviewerId,
            timestamp,
          }),
      ),
    reviewPackages: [],
  };
}

export function buildReviewPackagesFromDrafts({
  state,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  timestamp: string;
}) {
  const submitted =
    state.reviewerDrafts.map(
      (draft) =>
        submitReferenceWorkspaceForReview({
          draft,
          timestamp,
        }),
    );

  const packages =
    submitted.map(
      (draft) =>
        createReviewPackageFromWorkspace({
          draft,
          timestamp,
        }),
    );

  return {
    ...state,
    reviewerDrafts:
      submitted,
    reviewPackages:
      packages,
  };
}

export function approveAllReviewPackages({
  state,
  reviewerId,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  reviewerId: string;
  timestamp: string;
}) {
  const packages =
    state.reviewPackages.map(
      (reviewPackage) => {
        if (
          reviewPackage.submission
            .reviewerId ===
          reviewerId
        ) {
          throw new Error(
            "Bulk reviewer cannot approve their own calibration package.",
          );
        }

        return reviewPackage.claims.reduce(
          (
            current,
            claim,
          ) =>
            reviewReferenceClaim({
              package:
                current,
              claimId:
                claim.claimId,
              reviewerId,
              decision:
                "approved",
              note: "",
              timestamp,
            }),
          reviewPackage,
        );
      },
    );

  return {
    ...state,
    reviewPackages:
      packages,
  };
}

export function generateGoldStandardConsensus({
  state,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  timestamp: string;
}) {
  if (
    state.reviewPackages
      .length <
    2
  ) {
    throw new Error(
      "At least two reviewed packages are required.",
    );
  }

  const versionId =
    state.reviewPackages[
      0
    ]!.submission
      .versionId;

  const run =
    buildReferenceConsensus({
      packages:
        state.reviewPackages,
      fragranceId:
        state.target
          .fragranceId,
      versionId,
      timestamp,
    });

  return {
    ...state,
    consensusRun:
      run,
  };
}

export function certifyGoldStandardDataset({
  state,
  certifier,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  certifier:
    ReferenceReviewer;
  timestamp: string;
}) {
  if (
    !state.consensusRun
  ) {
    throw new Error(
      "Consensus must exist before certification.",
    );
  }

  const firstDraft =
    state.reviewerDrafts[
      0
    ];

  if (
    !firstDraft
  ) {
    throw new Error(
      "No calibration version is available.",
    );
  }

  const result =
    issueReferenceGoldStandardCertification({
      version: {
        versionId:
          firstDraft.versionId,
        sessionId:
          firstDraft.sessionId,
        fragranceId:
          firstDraft.fragranceId,
        version:
          firstDraft.calibrationVersion,
        status:
          "validated",
        createdAt:
          firstDraft.createdAt,
        createdBy:
          firstDraft.reviewerId,
      },
      run:
        state.consensusRun,
      packages:
        state.reviewPackages,
      certifier,
      issuedAt:
        timestamp,
    });

  return {
    state: {
      ...state,
      certificate:
        result.certificate,
    },
    result,
  };
}

export function registerGoldStandardDataset({
  state,
  actor,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  actor: string;
  timestamp: string;
}) {
  if (
    !state.certificate
  ) {
    throw new Error(
      "Gold Standard certificate required before registry entry.",
    );
  }

  const registryRecord =
    registerCertifiedReference({
      certificate:
        state.certificate,
      actor,
      timestamp,
    });

  return {
    ...state,
    registryRecord,
  };
}

export function buildGoldStandardFingerprints({
  state,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  timestamp: string;
}) {
  if (
    !state.registryRecord ||
    !state.consensusRun
  ) {
    throw new Error(
      "Registry record and certified consensus are required before fingerprints.",
    );
  }

  const bundle =
    buildProductionFingerprintBundle({
      record:
        state.registryRecord,
      run:
        state.consensusRun,
      timestamp,
    });

  const registryRecord =
    synchronizeRegistryCoverageFromFingerprints({
      record:
        state.registryRecord,
      bundle,
      timestamp,
    });

  return {
    ...state,
    registryRecord,
    fingerprintBundle:
      bundle,
  };
}

export function promoteGoldStandardDataset({
  state,
  approver,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  approver: string;
  timestamp: string;
}) {
  if (
    !state.registryRecord
  ) {
    throw new Error(
      "Registry record required before production promotion.",
    );
  }

  const promotion =
    createProductionPromotionPackage({
      record:
        state.registryRecord,
      timestamp,
    });

  if (
    promotion.status !==
    "ready"
  ) {
    return {
      ...state,
      promotion,
    };
  }

  const approved =
    approveProductionPromotion({
      promotion,
      approver,
      timestamp,
    });

  const activationPackage =
    createProductionActivationPackage({
      promotion:
        approved,
      actor:
        approver,
      timestamp,
    });

  return {
    ...state,
    promotion:
      approved,
    activationPackage,
  };
}

export function activateGoldStandardDataset({
  state,
  actor,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  actor: string;
  timestamp: string;
}) {
  if (
    !state.activationPackage ||
    !state.promotion ||
    !state.registryRecord ||
    !state.fingerprintBundle
  ) {
    throw new Error(
      "Approved activation package, promotion, registry record, and fingerprint bundle are required.",
    );
  }

  const result =
    activateProductionReference({
      activationPackage:
        state.activationPackage,
      promotion:
        state.promotion,
      registryRecord:
        state.registryRecord,
      fingerprintBundle:
        state.fingerprintBundle,
      actor,
      timestamp,
    });

  return {
    ...state,
    registryRecord:
      result.registryRecord,
    promotion:
      result.promotion,
    runtimeEntity:
      result.runtimeEntity,
  };
}

export function determineGoldStandardDatasetStage(
  state:
    GoldStandardDatasetBuildState,
): GoldStandardDatasetStage {
  if (
    state.runtimeEntity
  ) {
    return "activation";
  }

  if (
    state.activationPackage ||
    state.promotion
  ) {
    return "promotion";
  }

  if (
    state.fingerprintBundle
  ) {
    return "fingerprints";
  }

  if (
    state.registryRecord
  ) {
    return "registry";
  }

  if (
    state.certificate
  ) {
    return "certification";
  }

  if (
    state.consensusRun
  ) {
    return "consensus";
  }

  if (
    state.reviewPackages
      .length >
    0
  ) {
    return "review";
  }

  return "authoring";
}
