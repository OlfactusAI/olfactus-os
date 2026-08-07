import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import {
  compatibilityBlockers,
  scanReferenceProductionCompatibility,
} from "@/lib/production-pipeline/compatibility";
import type {
  ProductionActivationPackage,
  ReferenceProductionPromotionPackage,
} from "@/lib/production-pipeline/types";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";

export function createProductionPromotionPackage({
  record,
  timestamp,
}: {
  record:
    ReferenceRegistryRecord;
  timestamp: string;
}): ReferenceProductionPromotionPackage {
  const checks =
    scanReferenceProductionCompatibility(
      record,
    );

  const blockers =
    compatibilityBlockers(
      checks,
    );

  return {
    promotionId:
      createReferenceLabId(
        "ref-promotion",
        [
          record.referenceId,
          record.currentVersionId,
        ],
      ),
    referenceId:
      record.referenceId,
    fragranceId:
      record.fragranceId,
    versionId:
      record.currentVersionId,
    certificateId:
      record.currentCertificateId,
    status:
      blockers.length
        ? "blocked"
        : "ready",
    checks,
    blockers,
    createdAt:
      timestamp,
    updatedAt:
      timestamp,
    registrySnapshot:
      record,
  };
}

export function approveProductionPromotion({
  promotion,
  approver,
  timestamp,
}: {
  promotion:
    ReferenceProductionPromotionPackage;
  approver: string;
  timestamp: string;
}) {
  if (
    promotion.blockers.length >
    0 ||
    promotion.status !==
      "ready"
  ) {
    throw new Error(
      "Blocked production promotion cannot be approved.",
    );
  }

  return {
    ...promotion,
    status:
      "approved" as const,
    approvedBy:
      approver,
    approvedAt:
      timestamp,
    updatedAt:
      timestamp,
  };
}

export function createProductionActivationPackage({
  promotion,
  actor,
  timestamp,
}: {
  promotion:
    ReferenceProductionPromotionPackage;
  actor: string;
  timestamp: string;
}): ProductionActivationPackage {
  if (
    promotion.status !==
    "approved"
  ) {
    throw new Error(
      "Only an approved production promotion can generate an activation package.",
    );
  }

  return {
    activationId:
      createReferenceLabId(
        "ref-activation-package",
        [
          promotion.referenceId,
          promotion.versionId,
          timestamp,
        ],
      ),
    promotionId:
      promotion.promotionId,
    referenceId:
      promotion.referenceId,
    fragranceId:
      promotion.fragranceId,
    versionId:
      promotion.versionId,
    certificateId:
      promotion.certificateId,
    generatedAt:
      timestamp,
    generatedBy:
      actor,
    targetSystems: [
      "similarity",
      "recommendation",
      "collection-twin",
      "decision-lab",
      "weather",
      "blind-buy",
      "global-intelligence",
    ],
  };
}

export function markPromotionActivated({
  promotion,
  timestamp,
}: {
  promotion:
    ReferenceProductionPromotionPackage;
  timestamp: string;
}) {
  if (
    promotion.status !==
    "approved"
  ) {
    throw new Error(
      "Only approved promotions can be marked activated.",
    );
  }

  return {
    ...promotion,
    status:
      "activated" as const,
    activatedAt:
      timestamp,
    updatedAt:
      timestamp,
  };
}
