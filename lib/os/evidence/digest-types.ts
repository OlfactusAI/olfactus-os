import type {
  EvidenceRecord,
  EvidenceRelationship,
  FrozenResearchPack,
  SourceRecord,
} from "@/lib/os/contracts/evidence";

export type EvidenceDigestCoverage = "none" | "thin" | "supported" | "broad";

export interface EvidenceDigestItem {
  evidenceId: string;
  version: number;
  relationship: EvidenceRelationship;
  category: string;
  claim: string;
  confidence: number;
  sourceIds: string[];
}

export interface EvidenceDigestGap {
  code: "NO_EVIDENCE" | "SINGLE_EVIDENCE_ITEM" | "SINGLE_SOURCE" | "NO_PRIMARY_SOURCE";
  message: string;
}

export interface EvidenceDigestSection {
  sectionId: string;
  coverage: EvidenceDigestCoverage;
  evidenceCount: number;
  sourceCount: number;
  primarySourceCount: number;
  meanEvidenceConfidence: number | null;
  minimumEvidenceConfidence: number | null;
  supportingEvidence: EvidenceDigestItem[];
  contextualEvidence: EvidenceDigestItem[];
  cautionEvidence: EvidenceDigestItem[];
  contradictingEvidence: EvidenceDigestItem[];
  sourceRefs: Array<Pick<SourceRecord, "sourceId" | "publisher" | "sourceType" | "weight" | "version">>;
  gaps: EvidenceDigestGap[];
}

export interface EvidenceDigest {
  digestId: string;
  digestVersion: number;
  fragranceId: string;
  researchPackId: string;
  researchPackIntegrityHash: string;
  generatedAt: string;
  policy: {
    scoresIncluded: false;
    reviewerConclusionsIncluded: false;
    deterministic: true;
    purpose: string;
  };
  reviewerCautions: string[];
  sections: EvidenceDigestSection[];
  totals: {
    sectionCount: number;
    evidenceLinkCount: number;
    distinctEvidenceCount: number;
    distinctSourceCount: number;
    cautionLinkCount: number;
    contradictionLinkCount: number;
    contextualLinkCount: number;
  };
  integrityHash: string;
}

export interface DigestInput {
  pack: Pick<
    FrozenResearchPack,
    "researchPackId" | "fragranceId" | "integrityHash" | "sectionLinks" | "reviewerCautions"
  >;
  evidence: EvidenceRecord[];
  sources: SourceRecord[];
}
