import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";

export type RecommendationFactor =
  | "preference"
  | "role-gap"
  | "collection-diversity"
  | "overlap"
  | "weather"
  | "season"
  | "blind-buy-risk"
  | "budget"
  | "future-usage"
  | "memory"
  | "graph";

export interface RecommendationTraceStep {
  factor:
    RecommendationFactor;
  label: string;
  contribution: number;
  confidence: number;
  explanation: string;
}

export interface RecommendationTradeoff {
  advantages: string[];
  disadvantages: string[];
  netAssessment:
    | "strong-buy"
    | "buy"
    | "sample"
    | "wait"
    | "skip";
}

export interface OpportunityCostResult {
  candidateId: string;
  delayedCandidateId?: string;
  expectedGain: number;
  expectedLoss: number;
  netGain: number;
  explanation: string;
}

export interface RecommendationCandidateV2 {
  fragrance:
    FragranceRecord;
  score: number;
  confidence: number;
  trace:
    RecommendationTraceStep[];
  tradeoff:
    RecommendationTradeoff;
  opportunityCost:
    OpportunityCostResult;
}

export interface RecommendationRunV2 {
  modelVersion:
    "NRE-2.0.0";
  generatedAt: string;
  candidatePoolSize: number;
  candidates:
    RecommendationCandidateV2[];
  reasoningDepth: number;
  averageConfidence: number;
}
