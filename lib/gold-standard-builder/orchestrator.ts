import {
  generateGoldStandardConsensus,
  certifyGoldStandardDataset,
  registerGoldStandardDataset,
  buildGoldStandardFingerprints,
  promoteGoldStandardDataset,
} from "@/lib/gold-standard-builder/builder";
import {
  getDatasetReviewReadiness,
} from "@/lib/gold-standard-builder/review-console";
import type {
  GoldStandardDatasetBuildState,
} from "@/lib/gold-standard-builder/types";
import {
  resolveReferenceConflict,
} from "@/lib/reference-lab/conflict-resolution";
import {
  appendReferenceConflictResolution,
  upsertReferenceConsensusRun,
} from "@/lib/reference-lab/consensus-storage";
import {
  saveCertifiedReferenceVersion,
  saveReferenceCertificationAuditRecord,
  saveReferenceGoldStandardCertificate,
  saveReferenceProductionPromotionQueueItem,
} from "@/lib/reference-lab/certification-storage";
import type {
  ReferenceReviewer,
} from "@/lib/reference-lab/types";
import {
  upsertReferenceRegistryRecord,
} from "@/lib/reference-registry/storage";
import {
  saveProductionFingerprintBundle,
} from "@/lib/production-fingerprints/storage";
import {
  saveProductionActivationPackage,
  saveProductionPromotion,
} from "@/lib/production-pipeline/storage";

export function generateDatasetConsensus({
  state,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  timestamp: string;
}) {
  const reviewReadiness =
    getDatasetReviewReadiness(
      state,
    );

  if (
    !reviewReadiness.allApproved
  ) {
    throw new Error(
      "Both reviewer packages must be fully approved before consensus.",
    );
  }

  const next =
    generateGoldStandardConsensus({
      state,
      timestamp,
    });

  if (
    !next.consensusRun
  ) {
    throw new Error(
      "Consensus generation did not produce a run.",
    );
  }

  upsertReferenceConsensusRun(
    next.consensusRun,
  );

  return next;
}

export function resolveDatasetConsensusConflict({
  state,
  conflictId,
  status,
  resolution,
  reviewerId,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  conflictId: string;
  status:
    "resolved" |
    "dismissed";
  resolution: string;
  reviewerId: string;
  timestamp: string;
}) {
  if (
    !state.consensusRun
  ) {
    throw new Error(
      "Consensus must exist before resolving conflicts.",
    );
  }

  const conflict =
    state.consensusRun
      .conflicts
      .find(
        (item) =>
          item.conflictId ===
          conflictId,
      );

  if (!conflict) {
    throw new Error(
      "Calibration conflict not found.",
    );
  }

  const result =
    resolveReferenceConflict({
      conflict,
      status,
      resolution,
      resolvedBy:
        reviewerId,
      resolvedAt:
        timestamp,
    });

  appendReferenceConflictResolution(
    result.resolution,
  );

  const conflicts =
    state.consensusRun
      .conflicts
      .map(
        (item) =>
          item.conflictId ===
          conflictId
            ? result.conflict
            : item,
      );

  const consensusRun = {
    ...state.consensusRun,
    conflicts,
    snapshot: {
      ...state.consensusRun
        .snapshot,
      unresolvedConflictCount:
        conflicts.filter(
          (item) =>
            item.status ===
            "open",
        ).length,
    },
  };

  upsertReferenceConsensusRun(
    consensusRun,
  );

  return {
    ...state,
    consensusRun,
  };
}

export function certifyAndPrepareDataset({
  state,
  certifier,
  productionApprover,
  timestamp,
}: {
  state:
    GoldStandardDatasetBuildState;
  certifier:
    ReferenceReviewer;
  productionApprover: string;
  timestamp: string;
}) {
  if (
    !state.consensusRun
  ) {
    throw new Error(
      "Consensus must exist before certification.",
    );
  }

  const openConflicts =
    state.consensusRun
      .conflicts
      .filter(
        (conflict) =>
          conflict.status ===
          "open",
      );

  if (
    openConflicts.length >
    0
  ) {
    throw new Error(
      `${openConflicts.length} unresolved calibration conflict${openConflicts.length === 1 ? "" : "s"} block certification.`,
    );
  }

  const certification =
    certifyGoldStandardDataset({
      state,
      certifier,
      timestamp,
    });

  saveCertifiedReferenceVersion(
    certification.result
      .version,
  );

  saveReferenceGoldStandardCertificate(
    certification.result
      .certificate,
  );

  saveReferenceCertificationAuditRecord(
    certification.result
      .audit,
  );

  saveReferenceProductionPromotionQueueItem(
    certification.result
      .promotionQueueItem,
  );

  let next =
    certification.state;

  next =
    registerGoldStandardDataset({
      state:
        next,
      actor:
        certifier.reviewerId,
      timestamp,
    });

  if (
    next.registryRecord
  ) {
    upsertReferenceRegistryRecord(
      next.registryRecord,
    );
  }

  next =
    buildGoldStandardFingerprints({
      state:
        next,
      timestamp,
    });

  if (
    next.fingerprintBundle
  ) {
    saveProductionFingerprintBundle(
      next.fingerprintBundle,
    );
  }

  if (
    next.registryRecord
  ) {
    upsertReferenceRegistryRecord(
      next.registryRecord,
    );
  }

  next =
    promoteGoldStandardDataset({
      state:
        next,
      approver:
        productionApprover,
      timestamp,
    });

  if (
    next.promotion
  ) {
    saveProductionPromotion(
      next.promotion,
    );
  }

  if (
    next.activationPackage
  ) {
    saveProductionActivationPackage(
      next.activationPackage,
    );
  }

  return next;
}

export function getDatasetOrchestrationReadiness(
  state:
    GoldStandardDatasetBuildState,
) {
  const review =
    getDatasetReviewReadiness(
      state,
    );

  const consensus =
    state.consensusRun;

  const openConflicts =
    consensus?.conflicts
      .filter(
        (conflict) =>
          conflict.status ===
          "open",
      ).length ??
    0;

  return {
    reviewApproved:
      review.allApproved,
    consensusExists:
      Boolean(
        consensus,
      ),
    consensusMetrics:
      consensus?.snapshot
        .metrics.length ??
      0,
    openConflicts,
    certificationReady:
      Boolean(
        consensus
      ) &&
      openConflicts ===
        0 &&
      review.allApproved,
    certified:
      Boolean(
        state.certificate,
      ),
    registered:
      Boolean(
        state.registryRecord,
      ),
    fingerprintsComplete:
      Boolean(
        state.fingerprintBundle
          ?.productionReady,
      ),
    promotionStatus:
      state.promotion
        ?.status ??
      "not-created",
    activationPackageReady:
      Boolean(
        state.activationPackage,
      ),
  };
}
