import type { PredictionEvidence } from "@/lib/predictive/types";

export type ProjectionHorizon = 30 | 90 | 180 | 365;

export interface PredictiveSimulatorMetrics {
  currentHealth: number;
  immediateHealth: number;
  projectedHealthLow: number;
  projectedHealthHigh: number;
  redundancyDelta: number;
  diversityDelta: number;
  roleCoverageDelta: number;
  estimatedWearsPerMonth: number;
  signaturePotential: number;
  neglectRisk: number;
  retentionProbability: number;
  confidence: number;
}

export interface PredictiveSimulatorResult {
  fragranceId: string;
  fragranceName: string;
  brand: string;
  horizonDays: ProjectionHorizon;
  metrics: PredictiveSimulatorMetrics;
  verdict:
    | "STRONG LONG-TERM FIT"
    | "PROMISING ADDITION"
    | "UNCERTAIN OUTCOME"
    | "LIKELY TEMPORARY EXCITEMENT"
    | "HIGH REDUNDANCY RISK";
  summary: string;
  evidence: PredictionEvidence[];
}
