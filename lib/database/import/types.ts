import type {
  DatabaseSourceReference,
} from "@/lib/database/schema";

export type ImportFormat =
  | "json"
  | "csv";

export type ImportSeverity =
  | "error"
  | "warning"
  | "info";

export type ImportEntityKind =
  | "fragrance"
  | "brand"
  | "perfumer"
  | "note"
  | "accord"
  | "ingredient"
  | "line"
  | "relationship";

export interface ImportDiagnostic {
  row: number;
  field?: string;
  code:
    | "parse-error"
    | "missing-required-field"
    | "invalid-number"
    | "invalid-list"
    | "unknown-field"
    | "unsupported-record"
    | "normalization-applied";
  severity: ImportSeverity;
  message: string;
  value?: unknown;
}

export interface RawImportRow {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | string[]
    | number[];
}

export interface NormalizedFragranceImport {
  entityKind: "fragrance";
  sourceRow: number;
  id: string;
  name: string;
  brand: string;
  concentration: string;
  releaseYear?: number;
  family: string;
  perfumers: string[];
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  accords: string[];
  roles: string[];
  moods: string[];
  longevity?: number;
  projection?: number;
  sillage?: number;
  availability?:
    | "widely-available"
    | "limited"
    | "discontinued"
    | "unknown";
  aliases: string[];
  sourceReferences: DatabaseSourceReference[];
  original: RawImportRow;
}

export interface ImportParseResult {
  format: ImportFormat;
  rowsReceived: number;
  rowsParsed: number;
  rowsRejected: number;
  records: NormalizedFragranceImport[];
  diagnostics: ImportDiagnostic[];
}

export interface ImportParserOptions {
  sourceId?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  strict?: boolean;
  defaultFamily?: string;
  defaultConcentration?: string;
}

export interface ImportColumnMap {
  id: string[];
  name: string[];
  brand: string[];
  concentration: string[];
  releaseYear: string[];
  family: string[];
  perfumers: string[];
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  accords: string[];
  roles: string[];
  moods: string[];
  longevity: string[];
  projection: string[];
  sillage: string[];
  availability: string[];
  aliases: string[];
  sourceUrl: string[];
}


export type ImportMatchClassification =
  | "new"
  | "exact-duplicate"
  | "probable-duplicate"
  | "possible-variant"
  | "safe-update"
  | "conflicting-update"
  | "manual-review";

export type ImportRecommendedAction =
  | "create"
  | "skip"
  | "merge"
  | "update"
  | "review";

export interface ImportFieldConflict {
  field:
    | "name"
    | "brand"
    | "concentration"
    | "releaseYear"
    | "family"
    | "perfumers"
    | "topNotes"
    | "heartNotes"
    | "baseNotes"
    | "accords"
    | "availability";
  existingValue: unknown;
  incomingValue: unknown;
  status:
    | "same"
    | "incoming-adds-data"
    | "existing-more-complete"
    | "conflict";
  confidence: number;
  recommendation:
    | "keep-existing"
    | "use-incoming"
    | "merge-values"
    | "review";
}

export interface ImportMatchCandidate {
  existingFragranceId: string;
  score: number;
  nameScore: number;
  brandScore: number;
  concentrationScore: number;
  releaseYearScore: number;
  perfumerScore: number;
  notesScore: number;
  accordsScore: number;
  aliasScore: number;
}

export interface ImportRecordMatch {
  sourceRow: number;
  incomingId: string;
  classification:
    ImportMatchClassification;
  recommendedAction:
    ImportRecommendedAction;
  confidence: number;
  matchedFragranceId?: string;
  candidates: ImportMatchCandidate[];
  conflicts: ImportFieldConflict[];
  explanation: string;
}

export interface ImportMatchBatchResult {
  modelVersion: "GDM-2.0.0";
  generatedAt: string;
  recordsAnalyzed: number;
  newCount: number;
  exactDuplicateCount: number;
  probableDuplicateCount: number;
  possibleVariantCount: number;
  safeUpdateCount: number;
  conflictingUpdateCount: number;
  manualReviewCount: number;
  matches: ImportRecordMatch[];
}


export type ImportDecision =
  | "create"
  | "skip"
  | "merge"
  | "update"
  | "reject"
  | "review";

export type ImportSessionStatus =
  | "draft"
  | "ready"
  | "committed"
  | "cancelled"
  | "failed";

export interface StagedImportRecord {
  stageId: string;
  incoming: NormalizedFragranceImport;
  match: ImportRecordMatch;
  decision: ImportDecision;
  selectedExistingFragranceId?: string;
  notes?: string;
  resolvedConflicts: Record<
    string,
    "existing" | "incoming" | "merge"
  >;
}

export interface ImportPreviewSummary {
  total: number;
  create: number;
  skip: number;
  merge: number;
  update: number;
  reject: number;
  review: number;
  blockingReviewCount: number;
}

export interface ImportSession {
  sessionId: string;
  modelVersion: "GDI-2.0.0";
  createdAt: string;
  updatedAt: string;
  status: ImportSessionStatus;
  sourceFormat: ImportFormat;
  sourceLabel?: string;
  records: StagedImportRecord[];
  summary: ImportPreviewSummary;
}

export interface ImportCommitOperation {
  stageId: string;
  decision: ImportDecision;
  incomingId: string;
  existingFragranceId?: string;
  status:
    | "created"
    | "updated"
    | "merged"
    | "skipped"
    | "rejected"
    | "failed";
  message: string;
}

export interface ImportCommitReport {
  commitId: string;
  sessionId: string;
  modelVersion: "GDI-2.0.0";
  committedAt: string;
  success: boolean;
  createdCount: number;
  updatedCount: number;
  mergedCount: number;
  skippedCount: number;
  rejectedCount: number;
  failedCount: number;
  operations: ImportCommitOperation[];
  resultingCatalogSize: number;
}

export interface ImportCommitResult {
  catalog: import("@/lib/domain/fragrance").FragranceRecord[];
  report: ImportCommitReport;
}
