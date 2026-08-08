export type ReviewerId = "A" | "B";
export type ReviewerPackageState = "draft" | "frozen" | "submitted" | "reviewed" | "approved" | "returned";
export type ComparisonClass = "agreement" | "minor_variance" | "substantive_variance" | "adjudication_required";
export type ConsensusDecisionState = "open" | "resolved" | "approved";

export interface CalibrationAssessment<T = unknown> {
  sectionId: string;
  fieldId: string;
  value: T;
  confidence: number;
  rationale: string;
  evidenceIds: string[];
}

export interface ReviewerPackage {
  reviewerId: ReviewerId;
  fragranceId: string;
  researchPackId: string;
  packageVersion: number;
  state: ReviewerPackageState;
  assessments: CalibrationAssessment[];
  createdAt: string;
  frozenAt?: string;
  submittedAt?: string;
}

export interface FieldComparison<T = unknown> {
  sectionId: string;
  fieldId: string;
  reviewerA: CalibrationAssessment<T>;
  reviewerB: CalibrationAssessment<T>;
  classification: ComparisonClass;
}

export interface ConsensusDecision<T = unknown> {
  sectionId: string;
  fieldId: string;
  state: ConsensusDecisionState;
  value?: T;
  confidence?: number;
  rationale?: string;
  evidenceIds: string[];
  reviewerAValue: T;
  reviewerBValue: T;
}

export interface CertificationGateState {
  researchPackFrozen: boolean;
  evidenceIntegrityValid: boolean;
  reviewerAApproved: boolean;
  reviewerBApproved: boolean;
  requiredFieldsComplete: boolean;
  comparisonComplete: boolean;
  openRequiredConflicts: number;
  consensusApproved: boolean;
  schemaValid: boolean;
  identityVerified: boolean;
  registryCompatible: boolean;
  runtimeCompatible: boolean;
}

export function certificationReady(gates: CertificationGateState): boolean {
  return (
    gates.researchPackFrozen &&
    gates.evidenceIntegrityValid &&
    gates.reviewerAApproved &&
    gates.reviewerBApproved &&
    gates.requiredFieldsComplete &&
    gates.comparisonComplete &&
    gates.openRequiredConflicts === 0 &&
    gates.consensusApproved &&
    gates.schemaValid &&
    gates.identityVerified &&
    gates.registryCompatible &&
    gates.runtimeCompatible
  );
}
