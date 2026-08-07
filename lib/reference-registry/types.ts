import type {
  ReferenceGoldStandardCertificate,
} from "@/lib/reference-lab/certification-types";

export type ReferenceRegistryLifecycle =
  | "certified"
  | "registered"
  | "production-review"
  | "production-ready"
  | "active"
  | "deprecated"
  | "archived";

export type ReferenceProductionStatus =
  | "not-reviewed"
  | "blocked"
  | "ready"
  | "approved"
  | "active"
  | "rolled-back";

export interface ReferenceCoverage {
  similarity: number;
  recommendation: number;
  collectionTwin: number;
  decisionLab: number;
  weather: number;
  blindBuy: number;
  globalIntelligence: number;
}

export interface ReferenceRegistryVersion {
  versionId: string;
  calibrationVersion: string;
  certificateId: string;
  certificateHash: string;
  status:
    | "gold-standard"
    | "superseded"
    | "deprecated"
    | "archived";
  certifiedAt: string;
}

export interface ReferenceRegistryTimelineEvent {
  eventId: string;
  type:
    | "registered"
    | "production-review-started"
    | "production-approved"
    | "activated"
    | "rolled-back"
    | "deprecated"
    | "archived";
  timestamp: string;
  actor: string;
  detail: string;
}

export interface ReferenceRegistryRecord {
  referenceId: string;
  fragranceId: string;
  currentVersionId: string;
  currentCertificateId: string;
  lifecycle:
    ReferenceRegistryLifecycle;
  productionStatus:
    ReferenceProductionStatus;
  confidence: number;
  evidenceCompleteness: number;
  referenceQuality: number;
  reviewerCount: number;
  coverage:
    ReferenceCoverage;
  versions:
    ReferenceRegistryVersion[];
  timeline:
    ReferenceRegistryTimelineEvent[];
  certificate:
    ReferenceGoldStandardCertificate;
  createdAt: string;
  updatedAt: string;
}
