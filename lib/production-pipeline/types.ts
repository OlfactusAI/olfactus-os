import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";

export type ProductionCompatibilityCheck =
  | "gold-standard-certificate"
  | "version-locked"
  | "dna-profile"
  | "season-profile"
  | "weather-profile"
  | "role-profile"
  | "performance-profile"
  | "similarity-fingerprint"
  | "recommendation-fingerprint"
  | "collection-twin-fingerprint";

export interface ProductionCompatibilityResult {
  check:
    ProductionCompatibilityCheck;
  passed: boolean;
  detail: string;
}

export interface ReferenceProductionPromotionPackage {
  promotionId: string;
  referenceId: string;
  fragranceId: string;
  versionId: string;
  certificateId: string;
  status:
    | "pending"
    | "blocked"
    | "ready"
    | "approved"
    | "activated"
    | "rolled-back";
  checks:
    ProductionCompatibilityResult[];
  blockers: string[];
  approvedBy?: string;
  approvedAt?: string;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
  registrySnapshot:
    ReferenceRegistryRecord;
}

export interface ProductionActivationPackage {
  activationId: string;
  promotionId: string;
  referenceId: string;
  fragranceId: string;
  versionId: string;
  certificateId: string;
  generatedAt: string;
  generatedBy: string;
  targetSystems: Array<
    | "similarity"
    | "recommendation"
    | "collection-twin"
    | "decision-lab"
    | "weather"
    | "blind-buy"
    | "global-intelligence"
  >;
}
