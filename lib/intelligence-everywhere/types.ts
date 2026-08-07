export interface IntelligenceEvidence {
  source:
    | "collection"
    | "weather"
    | "market"
    | "history"
    | "profile"
    | "entity-graph"
    | "simulator";
  label: string;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface ExplainedScore {
  id: string;
  label: string;
  score: number;
  confidence: number;
  positives: string[];
  negatives: string[];
  evidence: IntelligenceEvidence[];
}

export interface RecommendationTraceStep {
  id: string;
  label: string;
  value: string;
  score?: number;
  explanation: string;
}

export interface RecommendationTrace {
  id: string;
  recommendation: string;
  confidence: number;
  steps: RecommendationTraceStep[];
}

export interface IntelligenceEvent {
  id: string;
  type:
    | "collection-health-change"
    | "rotation-streak"
    | "wear-streak"
    | "market-alert"
    | "dna-milestone"
    | "role-completed"
    | "new-best-performer"
    | "collection-milestone";
  title: string;
  summary: string;
  createdAt: string;
  severity:
    | "info"
    | "positive"
    | "warning";
  metadata:
    Record<string, unknown>;
}

export interface MemoryInsight {
  id: string;
  pattern:
    | "wear-context"
    | "purchase-sequence"
    | "family-preference"
    | "avoidance"
    | "finishing-pattern"
    | "seasonal-pattern";
  statement: string;
  confidence: number;
  evidenceCount: number;
  firstObservedAt: string;
  lastObservedAt: string;
}

export interface IntelligenceOverlayData {
  entityId: string;
  confidence: number;
  overlap: number;
  wearScoreToday: number;
  collectionRank: number;
  lastWornDays?: number;
  recommendation:
    | "excellent"
    | "strong"
    | "conditional"
    | "skip";
  valueTrend:
    | "rising"
    | "stable"
    | "falling"
    | "unknown";
}
