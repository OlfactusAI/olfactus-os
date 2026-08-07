export type FindingSeverity = "low" | "medium" | "high";

export interface Finding {
  type: "missing_role" | "season_gap" | "diversity_gap" | "redundancy" | "rotation";
  severity: FindingSeverity;
  title: string;
  explanation: string;
  confidence: number;
  evidence: unknown[];
}

export interface Recommendation {
  type: "wear" | "buy" | "avoid";
  priority: "low" | "medium" | "high";
  title: string;
  reason: string;
  projectedImpact: number;
  targetFragranceId?: string;
  confidence: number;
}

import type {
  CalibratedIntelligenceScore,
} from "@/lib/intelligence/confidence-calibration";

export interface CollectionHealthAnalysis {
  analysisType: "collection_health";
  score: number;
  calibration:
    CalibratedIntelligenceScore;
  status: "Excellent" | "Strong Foundation" | "Developing" | "Needs Attention";
  confidence: number;
  summary: string;
  dimensions: {
    roleCoverage: number;
    seasonalBalance: number;
    diversity: number;
    redundancy: number;
    rotation: number;
    intent: number;
    identity: number;
  };
  findings: Finding[];
  recommendations: Recommendation[];
  modelVersion: string;
}
