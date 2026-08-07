import type {
  PreferenceDimension,
  WeightedPreferenceDimension,
} from "@/lib/embedding/types";

export type SemanticComparisonOperator =
  | "more"
  | "less"
  | "at-least"
  | "at-most";

export interface SemanticConstraint {
  id: string;
  phrase: string;
  dimension:
    PreferenceDimension;
  operator:
    SemanticComparisonOperator;
  strength: number;
  referenceFragranceId?:
    string;
}

export interface InterpretedFragranceRequest {
  modelVersion:
    "PFL-1.0.0";
  originalText: string;
  normalizedText: string;
  constraints:
    SemanticConstraint[];
  weightedDimensions:
    WeightedPreferenceDimension[];
  referenceFragranceIds:
    string[];
  excludedFragranceIds:
    string[];
  confidence: number;
  explanation: string[];
}
