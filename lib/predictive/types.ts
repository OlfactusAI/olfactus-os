import type {
  DnaDimension,
} from "@/lib/domain/fragrance";

export interface PredictionEvidence {
  kind:
    | "verified"
    | "calculated"
    | "estimated"
    | "unavailable";
  label: string;
  detail: string;
  weight?: number;
}

export interface BottlePrediction {
  fragranceId: string;
  fragranceName: string;
  brand: string;
  retentionRisk: number;
  signaturePotential: number;
  confidence: number;
  horizonDays: number;
  status:
    | "stable"
    | "watch"
    | "at-risk"
    | "signature-candidate";
  explanation: string;
  evidence:
    PredictionEvidence[];
}

export interface PreferenceAffinity {
  id: string;
  label: string;
  score: number;
  confidence: number;
  evidenceCount: number;
  direction:
    | "rising"
    | "stable"
    | "falling";
}

export interface TasteDriftSignal {
  dimension:
    DnaDimension;
  previousScore: number;
  recentScore: number;
  delta: number;
  direction:
    | "rising"
    | "stable"
    | "falling";
  confidence: number;
  evidenceCount: number;
}

export interface AdaptiveRecommendation {
  fragranceId: string;
  fragranceName: string;
  brand: string;
  probability: number;
  confidence: number;
  summary: string;
  matchedFamilies:
    string[];
  matchedAccords:
    string[];
  evidence:
    PredictionEvidence[];
}

export interface PredictiveSnapshot {
  generatedAt: string;
  modelVersion:
    "PI-3.0.0-alpha.1";
  confidence: number;
  bottlePredictions:
    BottlePrediction[];
  familyAffinities:
    PreferenceAffinity[];
  accordAffinities:
    PreferenceAffinity[];
  tasteDrift:
    TasteDriftSignal[];
  adaptiveRecommendations:
    AdaptiveRecommendation[];
  strongestDrift?: TasteDriftSignal;
  topSignatureCandidate?:
    BottlePrediction;
  highestRetentionRisk?:
    BottlePrediction;
  evidenceEvents: number;
}
