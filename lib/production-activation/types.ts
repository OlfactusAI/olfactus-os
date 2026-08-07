import type {
  ProductionActivationPackage,
  ReferenceProductionPromotionPackage,
} from "@/lib/production-pipeline/types";
import type {
  ProductionFingerprintBundle,
} from "@/lib/production-fingerprints/types";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";

export interface RuntimeReferenceFingerprint {
  kind: string;
  completeness: number;
  metrics: Array<{
    key: string;
    value: number;
    confidence: number;
  }>;
}

export interface RuntimeReferenceEntity {
  runtimeReferenceId: string;
  referenceId: string;
  fragranceId: string;
  versionId: string;
  certificateId: string;
  certificateHash: string;
  sourceConsensusId: string;
  activatedAt: string;
  activatedBy: string;
  fingerprints:
    RuntimeReferenceFingerprint[];
}

export interface ProductionActivationAuditRecord {
  auditId: string;
  action:
    | "activated"
    | "rollback";
  referenceId: string;
  fragranceId: string;
  versionId: string;
  activationId: string;
  promotionId: string;
  actor: string;
  timestamp: string;
  reason?: string;
}

export interface ProductionActivationResult {
  runtimeEntity:
    RuntimeReferenceEntity;
  registryRecord:
    ReferenceRegistryRecord;
  promotion:
    ReferenceProductionPromotionPackage;
  audit:
    ProductionActivationAuditRecord;
}

export interface ProductionActivationInput {
  activationPackage:
    ProductionActivationPackage;
  promotion:
    ReferenceProductionPromotionPackage;
  registryRecord:
    ReferenceRegistryRecord;
  fingerprintBundle:
    ProductionFingerprintBundle;
  actor: string;
  timestamp: string;
}
