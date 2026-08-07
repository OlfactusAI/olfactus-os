import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import {
  addRegistryTimelineEvent,
} from "@/lib/reference-registry/registry";
import type {
  ProductionActivationInput,
  ProductionActivationResult,
  RuntimeReferenceEntity,
} from "@/lib/production-activation/types";

export function validateProductionActivationInput({
  activationPackage,
  promotion,
  registryRecord,
  fingerprintBundle,
}: Omit<
  ProductionActivationInput,
  "actor" |
  "timestamp"
>) {
  const blockers:
    string[] = [];

  if (
    promotion.status !==
    "approved"
  ) {
    blockers.push(
      "Promotion package is not approved.",
    );
  }

  if (
    activationPackage.promotionId !==
    promotion.promotionId
  ) {
    blockers.push(
      "Activation package does not match the approved promotion package.",
    );
  }

  if (
    activationPackage.referenceId !==
      registryRecord.referenceId ||
    activationPackage.versionId !==
      registryRecord.currentVersionId ||
    activationPackage.certificateId !==
      registryRecord.currentCertificateId
  ) {
    blockers.push(
      "Activation package does not match the registry's current certified reference version.",
    );
  }

  if (
    fingerprintBundle.referenceId !==
      registryRecord.referenceId ||
    fingerprintBundle.versionId !==
      registryRecord.currentVersionId ||
    fingerprintBundle.certificateId !==
      registryRecord.currentCertificateId
  ) {
    blockers.push(
      "Production fingerprint bundle does not match the current registry version.",
    );
  }

  if (
    !fingerprintBundle.productionReady ||
    fingerprintBundle.fingerprints.some(
      (fingerprint) =>
        fingerprint.status !==
        "complete" ||
        fingerprint.completeness <
        100,
    )
  ) {
    blockers.push(
      "All required production fingerprints must be complete before activation.",
    );
  }

  if (
    !registryRecord.certificate.locked
  ) {
    blockers.push(
      "Registry certificate is not locked.",
    );
  }

  if (
    registryRecord.certificate.certificateId !==
      activationPackage.certificateId
  ) {
    blockers.push(
      "Certificate identity mismatch.",
    );
  }

  if (
    registryRecord.certificate.consensusId !==
      fingerprintBundle.sourceConsensusId
  ) {
    blockers.push(
      "Fingerprint bundle consensus does not match the Gold Standard certificate.",
    );
  }

  return {
    eligible:
      blockers.length ===
      0,
    blockers,
  };
}

export function activateProductionReference({
  activationPackage,
  promotion,
  registryRecord,
  fingerprintBundle,
  actor,
  timestamp,
}: ProductionActivationInput): ProductionActivationResult {
  const validation =
    validateProductionActivationInput({
      activationPackage,
      promotion,
      registryRecord,
      fingerprintBundle,
    });

  if (
    !validation.eligible
  ) {
    throw new Error(
      `Production activation blocked: ${validation.blockers.join(" ")}`,
    );
  }

  const runtimeEntity:
    RuntimeReferenceEntity = {
    runtimeReferenceId:
      createReferenceLabId(
        "runtime-reference",
        [
          registryRecord.referenceId,
          registryRecord.currentVersionId,
        ],
      ),
    referenceId:
      registryRecord.referenceId,
    fragranceId:
      registryRecord.fragranceId,
    versionId:
      registryRecord.currentVersionId,
    certificateId:
      registryRecord.currentCertificateId,
    certificateHash:
      registryRecord.certificate.certificateHash,
    sourceConsensusId:
      fingerprintBundle.sourceConsensusId,
    activatedAt:
      timestamp,
    activatedBy:
      actor,
    fingerprints:
      fingerprintBundle.fingerprints.map(
        (fingerprint) => ({
          kind:
            fingerprint.kind,
          completeness:
            fingerprint.completeness,
          metrics:
            fingerprint.metrics.map(
              (metric) => ({
                key:
                  metric.key,
                value:
                  metric.value,
                confidence:
                  metric.confidence,
              }),
            ),
        }),
      ),
  };

  const nextRegistryRecord =
    addRegistryTimelineEvent({
      record: {
        ...registryRecord,
        lifecycle:
          "active",
        productionStatus:
          "active",
      },
      type:
        "activated",
      actor,
      timestamp,
      detail:
        `Activation package ${activationPackage.activationId} published runtime-safe reference ${runtimeEntity.runtimeReferenceId}.`,
    });

  const nextPromotion = {
    ...promotion,
    status:
      "activated" as const,
    activatedAt:
      timestamp,
    updatedAt:
      timestamp,
  };

  const audit = {
    auditId:
      createReferenceLabId(
        "production-activation-audit",
        [
          activationPackage.activationId,
          "activated",
          timestamp,
        ],
      ),
    action:
      "activated" as const,
    referenceId:
      registryRecord.referenceId,
    fragranceId:
      registryRecord.fragranceId,
    versionId:
      registryRecord.currentVersionId,
    activationId:
      activationPackage.activationId,
    promotionId:
      promotion.promotionId,
    actor,
    timestamp,
  };

  return {
    runtimeEntity,
    registryRecord:
      nextRegistryRecord,
    promotion:
      nextPromotion,
    audit,
  };
}
