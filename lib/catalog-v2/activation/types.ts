import type {
  FragrancePerformance,
  FragranceRecord,
  FragranceRole,
  IntelligenceStatus,
  Season,
} from "@/lib/domain/fragrance";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import type {
  ActivationDecision,
} from "@/lib/catalog-v2/activation/gateway";

export type CatalogActivationLevel =
  | "identity"
  | "discovery"
  | "intelligence"
  | "full";

export interface CatalogV2IntelligenceProfile {
  roles: FragranceRole[];
  seasons: Record<Season, number>;
  dna: FragranceRecord["dna"];
  moods: string[];
  performance: FragrancePerformance;
  notes?: FragranceRecord["notes"];
  market?: FragranceRecord["market"];
  intelligenceStatus?: IntelligenceStatus;
}

export interface CatalogActivationAssessment {
  level: CatalogActivationLevel;
  decision: ActivationDecision;
  reasons: string[];
  intelligenceEligible: boolean;
}

export interface ActivatedCatalogV2Entity {
  canonicalId: string;
  activationId: string;
  activatedAt: string;
  level: CatalogActivationLevel;
  sourceRecord: CatalogV2Record;
  fragrance?: FragranceRecord;
  confidence: number;
}
