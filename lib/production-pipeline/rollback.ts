import type {
  ReferenceProductionPromotionPackage,
} from "@/lib/production-pipeline/types";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";
import {
  addRegistryTimelineEvent,
} from "@/lib/reference-registry/registry";

export function rollbackReferenceProduction({
  promotion,
  record,
  actor,
  timestamp,
  reason,
}: {
  promotion:
    ReferenceProductionPromotionPackage;
  record:
    ReferenceRegistryRecord;
  actor: string;
  timestamp: string;
  reason: string;
}) {
  if (
    promotion.status !==
    "activated"
  ) {
    throw new Error(
      "Only an activated promotion can be rolled back.",
    );
  }

  if (
    !reason.trim()
  ) {
    throw new Error(
      "Production rollback requires a reason.",
    );
  }

  const rolledBackPromotion = {
    ...promotion,
    status:
      "rolled-back" as const,
    updatedAt:
      timestamp,
  };

  const rolledBackRecord =
    addRegistryTimelineEvent({
      record: {
        ...record,
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

  return {
    promotion:
      rolledBackPromotion,
    record:
      rolledBackRecord,
  };
}
