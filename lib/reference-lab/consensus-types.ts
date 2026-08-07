import type {
  ReferenceCalibrationConflict,
  ReferenceConsensusSnapshot,
} from "@/lib/reference-lab/types";

export interface ReferenceConsensusThresholds {
  lowMaxRange: number;
  moderateMaxRange: number;
  minimumReviewerCount: number;
}

export interface ReferenceConsensusRun {
  runId: string;
  fragranceId: string;
  versionId: string;
  sourcePackageIds: string[];
  sourceSubmissionIds: string[];
  reviewerIds: string[];
  generatedAt: string;
  thresholds:
    ReferenceConsensusThresholds;
  snapshot:
    ReferenceConsensusSnapshot;
  conflicts:
    ReferenceCalibrationConflict[];
}

export interface ReferenceConflictResolution {
  resolutionId: string;
  conflictId: string;
  status:
    | "resolved"
    | "dismissed";
  resolution: string;
  resolvedBy: string;
  resolvedAt: string;
}
