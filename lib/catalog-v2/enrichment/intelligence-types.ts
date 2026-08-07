import type {
  DnaDimension,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";
import type {
  CatalogSourceProvenance,
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

export type IntelligenceEvidenceMethod =
  | "official-source"
  | "licensed-source"
  | "curated-review"
  | "calculated"
  | "calibrated-model";

export type IntelligenceDraftStatus =
  | "draft"
  | "review"
  | "approved"
  | "rejected";

export interface IntelligenceEvidenceClaim<T> {
  value: T;
  confidence: number;
  method:
    IntelligenceEvidenceMethod;
  evidence: string;
  provenance?:
    CatalogSourceProvenance[];
}

export interface CatalogIntelligenceDraft {
  canonicalId: string;
  brand: string;
  name: string;
  status:
    IntelligenceDraftStatus;

  roles:
    IntelligenceEvidenceClaim<
      FragranceRole[]
    >;

  seasons:
    IntelligenceEvidenceClaim<
      Record<Season, number>
    >;

  dna:
    Partial<
      Record<
        DnaDimension,
        IntelligenceEvidenceClaim<number>
      >
    >;

  moods:
    IntelligenceEvidenceClaim<
      string[]
    >;

  performance: {
    longevity:
      IntelligenceEvidenceClaim<number>;
    projection:
      IntelligenceEvidenceClaim<number>;
    sillage:
      IntelligenceEvidenceClaim<number>;
  };

  sourceRecord:
    CatalogV2Record;

  createdAt: string;
  updatedAt: string;
}

export interface IntelligencePromotionDecision {
  eligible: boolean;
  confidence: number;
  reasons: string[];
  warnings: string[];
  coverage: {
    roles: boolean;
    seasons: boolean;
    dna: number;
    moods: boolean;
    performance: boolean;
  };
}
