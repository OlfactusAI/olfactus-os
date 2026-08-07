import type {
  CatalogSourceProvenance,
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

export interface CatalogFieldClaim {
  field: string;
  value:
    | string
    | number
    | string[];
  confidence: number;
  source:
    CatalogSourceProvenance;
}

export interface CatalogFieldConflict {
  canonicalId: string;
  field: string;
  claims:
    CatalogFieldClaim[];
  status:
    | "open"
    | "resolved";
  resolvedValue?:
    CatalogFieldClaim["value"];
}

export interface CatalogMergeResult {
  merged:
    CatalogV2Record;
  conflicts:
    CatalogFieldConflict[];
}
