import type {
  GoldStandardCertificate,
  ReferenceCalibrationVersion,
  ReferenceReviewer,
} from "@/lib/reference-lab/types";
import type {
  ReferenceConsensusRun,
} from "@/lib/reference-lab/consensus-types";

export interface ReferenceCertificationThresholds {
  minimumReviewerCount: number;
  minimumConsensusConfidence: number;
  minimumEvidenceCompleteness: number;
  minimumReferenceQuality: number;
  requireAllCalibrationMetrics: boolean;
}

export interface ReferenceCertificationReadiness {
  eligible: boolean;
  blockers: string[];
  warnings: string[];
  reviewerCount: number;
  consensusConfidence: number;
  evidenceCompleteness: number;
  calibrationMetricCoverage: number;
  unresolvedConflictCount: number;
  referenceQuality: number;
}

export interface ReferenceGoldStandardCertificate
  extends GoldStandardCertificate {
  consensusId: string;
  reviewerCount: number;
  sourcePackageIds: string[];
  certificateHash: string;
  certificationVersion:
    "GS-1.0.0";
}

export interface ReferenceCertificationAuditRecord {
  auditId: string;
  certificateId: string;
  fragranceId: string;
  versionId: string;
  consensusRunId: string;
  consensusId: string;
  sourcePackageIds: string[];
  sourceSubmissionIds: string[];
  reviewerIds: string[];
  issuedBy: string;
  issuedAt: string;
  certificateHash: string;
  readiness:
    ReferenceCertificationReadiness;
}

export interface ReferenceProductionPromotionQueueItem {
  queueId: string;
  certificateId: string;
  fragranceId: string;
  versionId: string;
  status:
    | "certified"
    | "production-review"
    | "approved"
    | "blocked";
  createdAt: string;
  createdBy: string;
  blockers: string[];
}

export interface ReferenceCertificationInput {
  version:
    ReferenceCalibrationVersion;
  run:
    ReferenceConsensusRun;
  packages:
    Array<{
      packageId: string;
      submission: {
        submissionId: string;
        fragranceId: string;
        versionId: string;
        reviewerId: string;
      };
      claims: Array<{
        claimId: string;
        evidenceIds: string[];
      }>;
      evidence: Array<{
        evidenceId: string;
      }>;
      state: string;
    }>;
  certifier:
    ReferenceReviewer;
}
