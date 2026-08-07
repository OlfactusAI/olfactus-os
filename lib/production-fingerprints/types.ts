export type ProductionFingerprintKind =
  | "dna"
  | "performance"
  | "season-weather"
  | "role-occasion"
  | "recommendation"
  | "similarity"
  | "collection-twin"
  | "blind-buy"
  | "decision-lab"
  | "global-intelligence";

export interface ProductionFingerprintMetric {
  key: string;
  value: number;
  confidence: number;
  sourceConsensusMetric:
    string;
}

export interface ProductionFingerprint {
  fingerprintId: string;
  referenceId: string;
  fragranceId: string;
  versionId: string;
  certificateId: string;
  kind:
    ProductionFingerprintKind;
  status:
    | "complete"
    | "incomplete";
  completeness: number;
  metrics:
    ProductionFingerprintMetric[];
  blockers: string[];
  generatedAt: string;
  sourceConsensusId: string;
}

export interface ProductionFingerprintBundle {
  bundleId: string;
  referenceId: string;
  fragranceId: string;
  versionId: string;
  certificateId: string;
  sourceConsensusId: string;
  fingerprints:
    ProductionFingerprint[];
  generatedAt: string;
  overallCompleteness: number;
  productionReady: boolean;
}
