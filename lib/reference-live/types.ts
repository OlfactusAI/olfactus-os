import type {
  ProductionActivationPackage,
  ReferenceProductionPromotionPackage,
} from "@/lib/production-pipeline/types";
import type {
  ProductionFingerprintBundle,
} from "@/lib/production-fingerprints/types";
import type {
  RuntimeReferenceEntity,
} from "@/lib/production-activation/types";
import type {
  ReferenceConsensusRun,
} from "@/lib/reference-lab/consensus-types";
import type {
  ReferenceGoldStandardCertificate,
} from "@/lib/reference-lab/certification-types";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";

export type LiveReferenceStage =
  | "consensus"
  | "certificate"
  | "registry"
  | "fingerprints"
  | "promotion"
  | "activation-package"
  | "runtime";

export interface LiveReferenceStageCheck {
  stage:
    LiveReferenceStage;
  passed: boolean;
  detail: string;
}

export interface LiveReferenceTrace {
  fragranceId: string;
  checks:
    LiveReferenceStageCheck[];
  readyToActivate: boolean;
  live: boolean;
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

export interface FirstLiveReferenceActivationResult {
  traceBefore:
    LiveReferenceTrace;
  traceAfter:
    LiveReferenceTrace;
}
