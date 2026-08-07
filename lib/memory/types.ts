export type MemoryEventType =
  | "navigation"
  | "fragrance-viewed"
  | "search-executed"
  | "comparison-executed"
  | "recommendation-shown"
  | "recommendation-accepted"
  | "recommendation-ignored"
  | "wear-recorded"
  | "collection-added"
  | "collection-removed"
  | "favorite-changed"
  | "simulation-created"
  | "simulation-applied"
  | "decision-recorded"
  | "purchase-recorded"
  | "bottle-finished"
  | "memory-corrected"
  | "memory-dismissed";

export type MemorySource =
  | "collection"
  | "analyst"
  | "navigation"
  | "search"
  | "simulator"
  | "timeline"
  | "decision"
  | "manual"
  | "system";

export interface MemoryEntityReference {
  type:
    | "fragrance"
    | "brand"
    | "perfumer"
    | "note"
    | "accord"
    | "family"
    | "workspace"
    | "collection";
  id: string;
  label?: string;
}

export interface MemoryEvent {
  id: string;
  timestamp: string;
  type:
    MemoryEventType;
  source:
    MemorySource;
  entity?:
    MemoryEntityReference;
  confidence: number;
  metadata:
    Record<
      string,
      string | number | boolean | string[] | undefined
    >;
  schemaVersion: 1;
}

export interface MemoryLedger {
  version: 1;
  events:
    MemoryEvent[];
}

export interface MemoryInsight {
  id: string;
  category:
    | "rotation"
    | "preference"
    | "recommendation"
    | "collection"
    | "behavior";
  title: string;
  statement: string;
  confidence: number;
  evidenceCount: number;
  generatedAt: string;
  relatedEntityIds:
    string[];
}

export interface CollectorDnaTrait {
  id:
    | "explorer"
    | "curator"
    | "minimalist"
    | "maximalist"
    | "daily-wearer"
    | "performance-seeker"
    | "seasonal-rotator"
    | "signature-loyalist"
    | "safe-buyer"
    | "blind-buyer"
    | "luxury-collector";
  label: string;
  score: number;
  confidence: number;
  evidenceCount: number;
  direction:
    | "rising"
    | "stable"
    | "falling";
  explanation: string;
}

export interface MemoryQuerySummary {
  totalEvents: number;
  firstEventAt?: string;
  latestEventAt?: string;
  wearCount: number;
  navigationCount: number;
  recommendationShownCount: number;
  recommendationAcceptedCount: number;
  recommendationAcceptanceRate?: number;
  mostWornFragranceId?: string;
  mostWornCount: number;
  mostViewedFragranceId?: string;
  mostViewedCount: number;
}
