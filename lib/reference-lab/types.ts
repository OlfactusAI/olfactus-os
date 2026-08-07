import type {
  DnaDimension,
  Season,
} from "@/lib/domain/fragrance";
import type {
  IntelligenceEvidenceMethod,
} from "@/lib/catalog-v2/enrichment/intelligence-types";

export type ReferenceCalibrationStatus =
  | "draft"
  | "review"
  | "calibration"
  | "validated"
  | "gold-standard"
  | "rejected"
  | "archived";

export type ReferenceClaimDomain =
  | "dna"
  | "performance"
  | "role"
  | "season"
  | "weather"
  | "time"
  | "formality"
  | "mood"
  | "collector-metric"
  | "similarity"
  | "identity";

export type ReferencePerformanceMetric =
  | "longevity"
  | "projection"
  | "sillage"
  | "consistency"
  | "development-speed"
  | "skin-persistence"
  | "air-persistence";

export type ReferenceCollectorMetric =
  | "signature-potential"
  | "collection-value"
  | "blind-buy-risk"
  | "collector-longevity"
  | "collection-uniqueness"
  | "versatility"
  | "rotation-importance"
  | "replacement-difficulty"
  | "bottle-finish-probability";

export type ReferenceFormality =
  | "casual"
  | "business-casual"
  | "business"
  | "formal"
  | "black-tie";

export type ReferenceTimeOfDay =
  | "morning"
  | "afternoon"
  | "evening"
  | "night";

export type ReferenceWeather =
  | "hot-dry"
  | "hot-humid"
  | "mild-dry"
  | "mild-humid"
  | "cold-dry"
  | "cold-humid"
  | "rain"
  | "wind";

export interface ReferenceReviewer {
  reviewerId: string;
  displayName: string;
  role:
    | "calibrator"
    | "reviewer"
    | "administrator";
  active: boolean;
}

export interface ReferenceEvidenceLink {
  evidenceId: string;
  label: string;
  method:
    IntelligenceEvidenceMethod;
  detail: string;
  sourceUrl?: string;
  sourceRecordId?: string;
  confidence: number;
  capturedAt: string;
  capturedBy: string;
}

export interface ReferenceClaim<T = unknown> {
  claimId: string;
  sessionId: string;
  fragranceId: string;
  versionId: string;
  reviewerId: string;
  domain:
    ReferenceClaimDomain;
  metric: string;
  value: T;
  confidence: number;
  rationale: string;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceReviewerSubmission {
  submissionId: string;
  sessionId: string;
  fragranceId: string;
  versionId: string;
  reviewerId: string;
  claimIds: string[];
  submittedAt: string;
  note?: string;
}

export interface ReferenceConsensusMetric<T = unknown> {
  domain:
    ReferenceClaimDomain;
  metric: string;
  value: T;
  confidence: number;
  reviewerCount: number;
  variance?: number;
  conflict:
    | "none"
    | "low"
    | "moderate"
    | "high";
  supportingClaimIds: string[];
}

export interface ReferenceConsensusSnapshot {
  consensusId: string;
  sessionId: string;
  fragranceId: string;
  versionId: string;
  generatedAt: string;
  metrics:
    ReferenceConsensusMetric[];
  averageConfidence: number;
  unresolvedConflictCount: number;
}

export interface ReferenceCalibrationConflict {
  conflictId: string;
  sessionId: string;
  fragranceId: string;
  versionId: string;
  domain:
    ReferenceClaimDomain;
  metric: string;
  claimIds: string[];
  severity:
    | "moderate"
    | "high";
  status:
    | "open"
    | "resolved"
    | "dismissed";
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ReferenceCalibrationVersion {
  versionId: string;
  sessionId: string;
  fragranceId: string;
  version: string;
  status:
    ReferenceCalibrationStatus;
  createdAt: string;
  createdBy: string;
  lockedAt?: string;
  lockedBy?: string;
  previousVersionId?: string;
  changeSummary?: string;
}

export interface ReferenceCalibrationSession {
  sessionId: string;
  fragranceId: string;
  brand: string;
  name: string;
  status:
    ReferenceCalibrationStatus;
  activeVersionId: string;
  reviewerIds: string[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface GoldStandardCertificate {
  certificateId: string;
  sessionId: string;
  fragranceId: string;
  versionId: string;
  calibrationVersion: string;
  issuedAt: string;
  issuedBy: string;
  referenceQuality: number;
  evidenceCompleteness: number;
  consensusConfidence: number;
  unresolvedConflictCount: number;
  locked: true;
}

export interface ReferenceLabSnapshot {
  session:
    ReferenceCalibrationSession;
  versions:
    ReferenceCalibrationVersion[];
  claims:
    ReferenceClaim[];
  evidence:
    ReferenceEvidenceLink[];
  submissions:
    ReferenceReviewerSubmission[];
  consensus:
    ReferenceConsensusSnapshot[];
  conflicts:
    ReferenceCalibrationConflict[];
  certificates:
    GoldStandardCertificate[];
}

export interface ReferenceIntelligenceProfileShape {
  dna:
    Partial<
      Record<
        DnaDimension,
        number
      >
    >;
  seasons:
    Partial<
      Record<
        Season,
        number
      >
    >;
  moods:
    Record<
      string,
      number
    >;
  performance:
    Partial<
      Record<
        ReferencePerformanceMetric,
        number
      >
    >;
  roles:
    Record<
      string,
      number
    >;
  weather:
    Partial<
      Record<
        ReferenceWeather,
        number
      >
    >;
  time:
    Partial<
      Record<
        ReferenceTimeOfDay,
        number
      >
    >;
  formality:
    Partial<
      Record<
        ReferenceFormality,
        number
      >
    >;
  collectorMetrics:
    Partial<
      Record<
        ReferenceCollectorMetric,
        number
      >
    >;
}
