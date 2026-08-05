export type DecisionType = "buy" | "wear" | "rotate" | "avoid";
export type DecisionVerdict = "buy" | "sample" | "skip";

export interface DecisionEvidence {
  key: string;
  label: string;
  value: number;
  interpretation: string;
  direction: "positive" | "neutral" | "negative";
}

export interface ProjectedImpact {
  currentHealth: number;
  projectedHealth: number;
  healthDelta: number;
  newRoles: string[];
  strongestImprovement: string;
}

export interface BuyDecision {
  analysisType: "buy_decision";
  candidateFragranceId: string;
  verdict: DecisionVerdict;
  score: number;
  risk: number;
  confidence: number;
  summary: string;
  evidence: DecisionEvidence[];
  projectedImpact: ProjectedImpact;
  closestOverlap?: {
    fragranceId: string;
    fragranceName: string;
    similarity: number;
  };
  modelVersion: "BDE-1.0.0";
}
