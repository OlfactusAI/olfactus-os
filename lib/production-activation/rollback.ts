import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import {
  addRegistryTimelineEvent,
} from "@/lib/reference-registry/registry";
import type {
  ReferenceProductionPromotionPackage,
} from "@/lib/production-pipeline/types";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";
import type {
  RuntimeReferenceEntity,
} from "@/lib/production-activation/types";

export function rollbackActivatedReference({
  runtimeEntity,
  registryRecord,
  promotion,
  actor,
  timestamp,
  reason,
}: {
  runtimeEntity:
    RuntimeReferenceEntity;
  registryRecord:
    ReferenceRegistryRecord;
  promotion:
    ReferenceProductionPromotionPackage;
  actor: string;
  timestamp: string;
  reason: string;
}) {
  if (
    registryRecord.productionStatus !==
      "active" ||
    promotion.status !==
      "activated"
  ) {
    throw new Error(
      "Only an active production reference can be rolled back.",
    );
  }

  if (
    !reason.trim()
  ) {
    throw new Error(
      "Production activation rollback requires a reason.",
    );
  }

  if (
    runtimeEntity.referenceId !==
      registryRecord.referenceId ||
    runtimeEntity.versionId !==
      registryRecord.currentVersionId
  ) {
    throw new Error(
      "Runtime reference does not match the active registry version.",
    );
  }

  const nextRegistryRecord =
    addRegistryTimelineEvent({
      record: {
        ...registryRecord,
        lifecycle:
          "registered",
        productionStatus:
          "rolled-back",
      },
      type:
        "rolled-back",
      actor,
      timestamp,
      detail:
        reason.trim(),
    });

  const nextPromotion = {
    ...promotion,
    status:
      "rolled-back" as const,
    updatedAt:
      timestamp,
  };

  const audit = {
    auditId:
      createReferenceLabId(
        "production-activation-audit",
        [
          runtimeEntity.runtimeReferenceId,
          "rollback",
          timestamp,
        ],
      ),
    action:
      "rollback" as const,
    referenceId:
      registryRecord.referenceId,
    fragranceId:
      registryRecord.fragranceId,
    versionId:
      registryRecord.currentVersionId,
    activationId:
      runtimeEntity.runtimeReferenceId,
    promotionId:
      promotion.promotionId,
    actor,
    timestamp,
    reason:
      reason.trim(),
  };

  return {
    registryRecord:
      nextRegistryRecord,
    promotion:
      nextPromotion,
    audit,
  };
}
