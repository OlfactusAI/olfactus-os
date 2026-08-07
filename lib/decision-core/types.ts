import type {
  ScoreProvenance,
} from "@/lib/intelligence-api/provenance";

export type UnifiedDecisionVerdict =
  | "buy"
  | "sample"
  | "wait"
  | "skip"
  | "replace"
  | "keep"
  | "revisit"
  | "sell";

export interface UnifiedDecisionFactor {
  id: string;
  label: string;
  score: number;
  direction:
    | "positive"
    | "neutral"
    | "negative";
  explanation: string;
  model: string;
}

export interface UnifiedDecision {
  decisionVersion:
    "UDC-1.0.0";
  generatedAt: string;
  targetFragranceId: string;
  targetFragranceName: string;
  mode:
    | "candidate"
    | "owned";
  verdict:
    UnifiedDecisionVerdict;
  score: number;
  risk: number;
  confidence: number;
  summary: string;
  positives:
    UnifiedDecisionFactor[];
  friction:
    UnifiedDecisionFactor[];
  factors:
    UnifiedDecisionFactor[];
  closestOverlap?: {
    fragranceId: string;
    fragranceName: string;
    similarity: number;
  };
  projectedHealth?: {
    current: number;
    immediate: number;
    delta: number;
    sixMonth?: number;
  };
  provenance:
    ScoreProvenance;
}
