export type PreferenceDimension =
  | "freshness"
  | "sweetness"
  | "darkness"
  | "dryness"
  | "warmth"
  | "density"
  | "airiness"
  | "projection"
  | "formality"
  | "novelty"
  | "familiarity"
  | "creaminess"
  | "smokiness"
  | "greenness"
  | "fruitiness"
  | "floral"
  | "mineral"
  | "cleanliness"
  | "woodiness"
  | "amber"
  | "complexity";

export type PreferenceEmbedding =
  Record<
    PreferenceDimension,
    number
  >;

export interface WeightedPreferenceDimension {
  dimension:
    PreferenceDimension;
  target: number;
  weight: number;
  direction:
    | "toward"
    | "away"
    | "minimum"
    | "maximum";
  source: string;
}

export interface CollectorPreferenceEmbedding {
  modelVersion:
    "PEM-1.0.0";
  generatedAt: string;
  confidence: number;
  dimensions:
    PreferenceEmbedding;
  strongestDimensions:
    Array<{
      dimension:
        PreferenceDimension;
      score: number;
    }>;
  evidence: string[];
}
