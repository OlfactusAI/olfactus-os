export type CatalogSourceKind =
  | "curated"
  | "open-data"
  | "licensed-api"
  | "user-import"
  | "migration";

export type CatalogValidationStatus =
  | "draft"
  | "review"
  | "validated"
  | "rejected";

export interface CatalogSourceProvenance {
  sourceId: string;
  sourceKind: CatalogSourceKind;
  sourceName: string;
  sourceRecordId?: string;
  importedAt: string;
  retrievedAt?: string;
  license?: string;
  sourceUrl?: string;
  confidence: number;
}

export interface CatalogV2Record {
  canonicalId: string;
  brand: string;
  name: string;
  aliases: string[];
  releaseYear?: number;
  concentration?: string;
  genderPositioning?: string;
  family?: string;
  perfumers: string[];
  notes: string[];
  accords: string[];
  collections: string[];
  parentCompany?: string;
  country?: string;
  validationStatus: CatalogValidationStatus;
  provenance: CatalogSourceProvenance[];
  fieldConfidence: Record<string, number>;
}

export interface CatalogImportRow {
  id?: string;
  brand?: string;
  name?: string;
  aliases?: string[] | string;
  releaseYear?: number | string;
  concentration?: string;
  genderPositioning?: string;
  family?: string;
  perfumers?: string[] | string;
  notes?: string[] | string;
  accords?: string[] | string;
  collections?: string[] | string;
  parentCompany?: string;
  country?: string;
}

export interface CatalogValidationIssue {
  severity:
    | "error"
    | "warning"
    | "info";
  field?: string;
  message: string;
}

export interface CatalogImportPreview {
  accepted: CatalogV2Record[];
  rejected: Array<{
    row: CatalogImportRow;
    issues: CatalogValidationIssue[];
  }>;
  duplicateCandidates: Array<{
    incomingId: string;
    existingId: string;
    score: number;
    reason: string;
  }>;
}
