import type {
  ReferenceWorkspaceDraft,
} from "@/lib/reference-lab/workspace";
import type {
  ReferenceReviewPackage,
} from "@/lib/reference-lab/review-types";
import type {
  ReferenceConsensusRun,
} from "@/lib/reference-lab/consensus-types";
import type {
  ReferenceGoldStandardCertificate,
} from "@/lib/reference-lab/certification-types";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";
import type {
  ProductionFingerprintBundle,
} from "@/lib/production-fingerprints/types";
import type {
  ReferenceProductionPromotionPackage,
  ProductionActivationPackage,
} from "@/lib/production-pipeline/types";
import type {
  RuntimeReferenceEntity,
} from "@/lib/production-activation/types";

export interface GoldStandardDatasetTarget {
  fragranceId: string;
  brand: string;
  name: string;
}

export interface GoldStandardDatasetReviewer {
  reviewerId: string;
  displayName: string;
}

export interface GoldStandardDatasetBuildState {
  target:
    GoldStandardDatasetTarget;
  reviewerDrafts:
    ReferenceWorkspaceDraft[];
  reviewPackages:
    ReferenceReviewPackage[];
  consensusRun?:
    ReferenceConsensusRun;
  certificate?:
    ReferenceGoldStandardCertificate;
  registryRecord?:
    ReferenceRegistryRecord;
  fingerprintBundle?:
    ProductionFingerprintBundle;
  promotion?:
    ReferenceProductionPromotionPackage;
  activationPackage?:
    ProductionActivationPackage;
  runtimeEntity?:
    RuntimeReferenceEntity;
}

export type GoldStandardDatasetStage =
  | "authoring"
  | "review"
  | "consensus"
  | "certification"
  | "registry"
  | "fingerprints"
  | "promotion"
  | "activation";
