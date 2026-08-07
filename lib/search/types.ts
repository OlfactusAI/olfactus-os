export type UniversalSearchEntityType =
  | "fragrance"
  | "brand"
  | "perfumer"
  | "note"
  | "accord"
  | "ingredient"
  | "line";

export interface UniversalSearchDocument {
  id: string;
  entityType:
    UniversalSearchEntityType;
  label: string;
  subtitle?: string;
  aliases: string[];
  keywords: string[];
  route: string;
  qualityScore: number;
  popularityScore: number;
  source:
    | "bundled"
    | "imported";
  metadata: Record<
    string,
    string | number | boolean | string[] | undefined
  >;
}

export interface UniversalSearchHit {
  document:
    UniversalSearchDocument;
  score: number;
  matchType:
    | "exact"
    | "prefix"
    | "partial"
    | "alias"
    | "keyword"
    | "typo";
  matchedValue: string;
  explanation: string;
}

export interface UniversalSearchGroup {
  entityType:
    UniversalSearchEntityType;
  label: string;
  hits: UniversalSearchHit[];
}

export interface UniversalSearchResult {
  query: string;
  normalizedQuery: string;
  total: number;
  groups: UniversalSearchGroup[];
  hits: UniversalSearchHit[];
  generatedAt: string;
}

export interface UniversalSearchOptions {
  entityTypes?: UniversalSearchEntityType[];
  limit?: number;
  limitPerGroup?: number;
  typoTolerance?: number;
  includeImported?: boolean;
}

export interface UniversalSearchIndex {
  version: "USE-2.0.0";
  generatedAt: string;
  documents: UniversalSearchDocument[];
  documentsById: Map<
    string,
    UniversalSearchDocument
  >;
  tokenIndex: Map<
    string,
    Set<string>
  >;
}
