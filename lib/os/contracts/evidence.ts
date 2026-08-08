export type EvidenceStatus = "draft" | "reviewed" | "accepted" | "superseded" | "rejected";
export type EvidenceRelationship = "supports" | "contradicts" | "contextualizes" | "cautions";
export type SourceWeight = "primary" | "secondary";

export interface SourceRecord {
  sourceId: string;
  publisher: string;
  sourceType: string;
  locator: string;
  accessedAt: string;
  weight: SourceWeight;
  status: EvidenceStatus;
  version: number;
}

export interface EvidenceScope {
  edition?: string;
  concentration?: string;
  batchEra?: string;
  market?: string;
  validFrom?: string;
  validTo?: string;
}

export interface EvidenceRecord {
  evidenceId: string;
  fragranceId: string;
  category: string;
  claim: string;
  sourceIds: string[];
  confidence: number;
  status: EvidenceStatus;
  version: number;
  createdAt: string;
  scope?: EvidenceScope;
  supersedesEvidenceId?: string;
}

export interface EvidenceLink {
  evidenceId: string;
  sectionId: string;
  fieldId?: string;
  relationship: EvidenceRelationship;
}

export interface FrozenResearchPack {
  researchPackId: string;
  fragranceId: string;
  researchPackVersion: number;
  generatedAt: string;
  frozenAt: string;
  evidenceRefs: Array<{ evidenceId: string; version: number }>;
  sourceRefs: Array<{ sourceId: string; version: number }>;
  sectionLinks: EvidenceLink[];
  reviewerCautions: string[];
  policy: {
    scoresIncluded: false;
    purpose: string;
  };
  integrityHash: string;
}

export function assertEvidenceConfidence(confidence: number): void {
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
    throw new Error("Evidence confidence must be between 0 and 100.");
  }
}

export function assertNoScoresInResearchPack(pack: FrozenResearchPack): void {
  if (pack.policy.scoresIncluded !== false) {
    throw new Error("Research packs must never include OLFACTUS calibration scores.");
  }
}
