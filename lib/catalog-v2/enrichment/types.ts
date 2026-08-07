import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

export type CatalogEnrichmentPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export interface CatalogEnrichmentTask {
  canonicalId: string;
  brand: string;
  name: string;
  completeness: number;
  priority:
    CatalogEnrichmentPriority;
  missingFields: string[];
  sourceCount: number;
  currentTier:
    | "identity"
    | "discovery";
  record:
    CatalogV2Record;
}
