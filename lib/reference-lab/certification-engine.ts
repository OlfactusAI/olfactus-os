import {
  createGoldStandardCertificate,
} from "@/lib/reference-lab/certificate";
import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import {
  lockCalibrationVersion,
} from "@/lib/reference-lab/versioning";
import {
  requiredCalibrationMetricCount,
} from "@/lib/reference-lab/workspace-schema";
import type {
  ReferenceCertificationAuditRecord,
  ReferenceCertificationInput,
  ReferenceCertificationReadiness,
  ReferenceCertificationThresholds,
  ReferenceGoldStandardCertificate,
  ReferenceProductionPromotionQueueItem,
} from "@/lib/reference-lab/certification-types";

export const defaultReferenceCertificationThresholds:
  ReferenceCertificationThresholds = {
  minimumReviewerCount: 2,
  minimumConsensusConfidence: 80,
  minimumEvidenceCompleteness: 95,
  minimumReferenceQuality: 85,
  requireAllCalibrationMetrics: true,
};

export function evaluateReferenceCertificationReadiness({
  version,
  run,
  packages,
  certifier,
  thresholds =
    defaultReferenceCertificationThresholds,
}: ReferenceCertificationInput & {
  thresholds?:
    ReferenceCertificationThresholds;
}): ReferenceCertificationReadiness {
  const blockers:
    string[] = [];
  const warnings:
    string[] = [];

  const sourcePackages =
    packages.filter(
      (item) =>
        run.sourcePackageIds.includes(
          item.packageId,
        ),
    );

  const reviewerCount =
    new Set(
      run.reviewerIds,
    ).size;

  const consensusConfidence =
    run.snapshot.averageConfidence;

  const evidenceCompleteness =
    calculateEvidenceCompleteness(
      sourcePackages,
    );

  const calibrationMetricCoverage =
    Math.round(
      (
        run.snapshot.metrics
          .length /
        requiredCalibrationMetricCount
      ) *
        100,
    );

  const unresolvedConflictCount =
    run.conflicts.filter(
      (conflict) =>
        conflict.status ===
        "open",
    ).length;

  const referenceQuality =
    calculateReferenceQuality({
      consensusConfidence,
      evidenceCompleteness,
      calibrationMetricCoverage,
      unresolvedConflictCount,
      reviewerCount,
    });

  if (
    certifier.role !==
      "administrator" ||
    !certifier.active
  ) {
    blockers.push(
      "Gold Standard certification requires an active Reference Laboratory administrator.",
    );
  }

  if (
    reviewerCount <
    thresholds.minimumReviewerCount
  ) {
    blockers.push(
      `Reviewer coverage ${reviewerCount}/${thresholds.minimumReviewerCount} is insufficient.`,
    );
  }

  if (
    consensusConfidence <
    thresholds.minimumConsensusConfidence
  ) {
    blockers.push(
      `Consensus confidence ${consensusConfidence}% is below the ${thresholds.minimumConsensusConfidence}% threshold.`,
    );
  }

  if (
    evidenceCompleteness <
    thresholds.minimumEvidenceCompleteness
  ) {
    blockers.push(
      `Evidence completeness ${evidenceCompleteness}% is below the ${thresholds.minimumEvidenceCompleteness}% threshold.`,
    );
  }

  if (
    thresholds.requireAllCalibrationMetrics &&
    run.snapshot.metrics.length <
      requiredCalibrationMetricCount
  ) {
    blockers.push(
      `Calibration coverage is incomplete: ${run.snapshot.metrics.length}/${requiredCalibrationMetricCount} required metrics reached consensus.`,
    );
  }

  if (
    unresolvedConflictCount >
    0
  ) {
    blockers.push(
      `${unresolvedConflictCount} unresolved calibration conflict${unresolvedConflictCount === 1 ? "" : "s"} remain.`,
    );
  }

  if (
    version.lockedAt
  ) {
    blockers.push(
      "Calibration version is already locked.",
    );
  }

  if (
    version.fragranceId !==
      run.fragranceId ||
    version.versionId !==
      run.versionId
  ) {
    blockers.push(
      "Consensus run does not match the calibration version being certified.",
    );
  }

  if (
    referenceQuality <
    thresholds.minimumReferenceQuality
  ) {
    blockers.push(
      `Reference quality ${referenceQuality}% is below the ${thresholds.minimumReferenceQuality}% threshold.`,
    );
  }

  if (
    reviewerCount ===
    thresholds.minimumReviewerCount
  ) {
    warnings.push(
      "Certification meets the minimum reviewer count but has no additional reviewer redundancy.",
    );
  }

  return {
    eligible:
      blockers.length ===
      0,
    blockers,
    warnings,
    reviewerCount,
    consensusConfidence,
    evidenceCompleteness,
    calibrationMetricCoverage:
      Math.max(
        0,
        Math.min(
          100,
          calibrationMetricCoverage,
        ),
      ),
    unresolvedConflictCount,
    referenceQuality,
  };
}

export function issueReferenceGoldStandardCertification({
  version,
  run,
  packages,
  certifier,
  issuedAt,
  thresholds =
    defaultReferenceCertificationThresholds,
}: ReferenceCertificationInput & {
  issuedAt: string;
  thresholds?:
    ReferenceCertificationThresholds;
}) {
  const readiness =
    evaluateReferenceCertificationReadiness({
      version,
      run,
      packages,
      certifier,
      thresholds,
    });

  if (
    !readiness.eligible
  ) {
    throw new Error(
      `Gold Standard certification blocked: ${readiness.blockers.join(" ")}`,
    );
  }

  const goldVersion =
    lockCalibrationVersion({
      version: {
        ...version,
        status:
          "gold-standard",
      },
      lockedBy:
        certifier.reviewerId,
      lockedAt:
        issuedAt,
    });

  const baseCertificate =
    createGoldStandardCertificate({
      version:
        goldVersion,
      consensus:
        run.snapshot,
      issuedBy:
        certifier.reviewerId,
      issuedAt,
      referenceQuality:
        readiness.referenceQuality,
      evidenceCompleteness:
        readiness.evidenceCompleteness,
    });

  const certificateHash =
    createCertificateHash({
      certificateId:
        baseCertificate
          .certificateId,
      fragranceId:
        baseCertificate
          .fragranceId,
      versionId:
        baseCertificate
          .versionId,
      consensusId:
        run.snapshot
          .consensusId,
      issuedAt,
      issuedBy:
        certifier.reviewerId,
      referenceQuality:
        readiness.referenceQuality,
    });

  const certificate:
    ReferenceGoldStandardCertificate = {
    ...baseCertificate,
    consensusId:
      run.snapshot
        .consensusId,
    reviewerCount:
      readiness
        .reviewerCount,
    sourcePackageIds: [
      ...run.sourcePackageIds,
    ],
    certificateHash,
    certificationVersion:
      "GS-1.0.0",
  };

  const audit:
    ReferenceCertificationAuditRecord = {
    auditId:
      createReferenceLabId(
        "ref-certification-audit",
        [
          certificate
            .certificateId,
          issuedAt,
        ],
      ),
    certificateId:
      certificate
        .certificateId,
    fragranceId:
      certificate
        .fragranceId,
    versionId:
      certificate
        .versionId,
    consensusRunId:
      run.runId,
    consensusId:
      run.snapshot
        .consensusId,
    sourcePackageIds: [
      ...run.sourcePackageIds,
    ],
    sourceSubmissionIds: [
      ...run
        .sourceSubmissionIds,
    ],
    reviewerIds: [
      ...run.reviewerIds,
    ],
    issuedBy:
      certifier.reviewerId,
    issuedAt,
    certificateHash,
    readiness,
  };

  const promotionQueueItem:
    ReferenceProductionPromotionQueueItem = {
    queueId:
      createReferenceLabId(
        "ref-production-queue",
        [
          certificate
            .certificateId,
        ],
      ),
    certificateId:
      certificate
        .certificateId,
    fragranceId:
      certificate
        .fragranceId,
    versionId:
      certificate
        .versionId,
    status:
      "certified",
    createdAt:
      issuedAt,
    createdBy:
      certifier.reviewerId,
    blockers: [
      "Production promotion has not yet been reviewed.",
      "Certified reference is not automatically active in NRE.",
    ],
  };

  return {
    version:
      goldVersion,
    certificate,
    audit,
    promotionQueueItem,
    readiness,
  };
}

function calculateEvidenceCompleteness(
  packages:
    ReferenceCertificationInput["packages"],
) {
  const claimEvidencePairs =
    packages.flatMap(
      (item) => {
        const evidenceIds =
          new Set(
            item.evidence.map(
              (evidence) =>
                evidence.evidenceId,
            ),
          );

        return item.claims.map(
          (claim) => ({
            hasEvidence:
              claim.evidenceIds
                .length >
                0 &&
              claim.evidenceIds.every(
                (id) =>
                  evidenceIds.has(
                    id,
                  ),
              ),
          }),
        );
      },
    );

  if (
    claimEvidencePairs.length ===
    0
  ) {
    return 0;
  }

  return Math.round(
    (
      claimEvidencePairs.filter(
        (item) =>
          item.hasEvidence,
      ).length /
      claimEvidencePairs.length
    ) *
      100,
  );
}

function calculateReferenceQuality({
  consensusConfidence,
  evidenceCompleteness,
  calibrationMetricCoverage,
  unresolvedConflictCount,
  reviewerCount,
}: {
  consensusConfidence: number;
  evidenceCompleteness: number;
  calibrationMetricCoverage: number;
  unresolvedConflictCount: number;
  reviewerCount: number;
}) {
  const reviewerScore =
    Math.min(
      100,
      70 +
        reviewerCount *
          10,
    );

  const conflictPenalty =
    unresolvedConflictCount *
    15;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        consensusConfidence *
          0.35 +
          evidenceCompleteness *
            0.25 +
          Math.min(
            100,
            calibrationMetricCoverage,
          ) *
            0.25 +
          reviewerScore *
            0.15 -
          conflictPenalty,
      ),
    ),
  );
}

function createCertificateHash(
  input: {
    certificateId: string;
    fragranceId: string;
    versionId: string;
    consensusId: string;
    issuedAt: string;
    issuedBy: string;
    referenceQuality: number;
  },
) {
  const raw =
    [
      input.certificateId,
      input.fragranceId,
      input.versionId,
      input.consensusId,
      input.issuedAt,
      input.issuedBy,
      input.referenceQuality,
    ].join(
      "|",
    );

  let hash =
    2166136261;

  for (
    let index = 0;
    index <
    raw.length;
    index += 1
  ) {
    hash ^=
      raw.charCodeAt(
        index,
      );
    hash =
      Math.imul(
        hash,
        16777619,
      );
  }

  return `gs1-${(
    hash >>>
    0
  )
    .toString(16)
    .padStart(
      8,
      "0",
    )}`;
}
