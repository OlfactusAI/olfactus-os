import type { EvidenceRecord, FrozenResearchPack, SourceRecord } from "@/lib/os/contracts/evidence";

export interface EvidenceRepository {
  repositoryId: string;
  fragranceId: string;
  repositoryVersion: number;
  migratedFrom?: string;
  migratedAt: string;
  sources: SourceRecord[];
  evidence: EvidenceRecord[];
  legacyIdMap?: {
    sources: Record<string, string>;
    facts: Record<string, string>;
  };
}

export interface ResolvedFrozenResearchPack {
  pack: FrozenResearchPack;
  sources: SourceRecord[];
  evidence: EvidenceRecord[];
}
