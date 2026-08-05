export const roles = [
  "office",
  "casual",
  "date",
  "formal",
  "summer",
  "winter",
  "creative",
  "signature",
  "travel",
] as const;

export type FragranceRole = (typeof roles)[number];

export type Season = "spring" | "summer" | "fall" | "winter";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type ClimateCondition =
  | "high-heat"
  | "warm"
  | "mild"
  | "cold"
  | "humid"
  | "dry";

export type IntelligenceStatus = "draft" | "calibration" | "validated";

export type DnaDimension =
  | "fresh"
  | "green"
  | "woody"
  | "amber"
  | "sweet"
  | "dark"
  | "artistic"
  | "formal";

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface FragrancePerformance {
  projection: number;
  longevity: number;

  /**
   * Optional until each calibration record is fully modeled.
   * All intelligence scores use a 0–100 scale.
   */
  sillage?: number;
  consistency?: number;
  drydownQuality?: number;
}

export interface FragranceClimateProfile {
  highHeat: number;
  humidity: number;
  cold: number;
  dryClimate: number;
}

export interface FragranceMarketProfile {
  retailPrice?: number;
  typicalMarketPrice?: number;
  currency?: string;
  valueScore?: number;
  availability?: "widely-available" | "limited" | "discontinued";
}

export interface FragranceIntelligenceMetadata {
  confidence: number;
  version: string;
  lastReviewed?: string;
  reviewedBy?: string[];
}

export interface FragranceRecord {
  /**
   * Stable canonical identity.
   */
  id: string;
  brand: string;
  name: string;
  concentration: string;

  /**
   * Identity and provenance.
   */
  releaseYear?: number;
  perfumers?: string[];
  countryOfOrigin?: string;

  /**
   * Composition.
   */
  family: string;
  subfamily?: string;
  accords?: string[];
  notes?: FragranceNotes;

  /**
   * Functional intelligence.
   */
  roles: FragranceRole[];
  seasons: Record<Season, number>;
  timesOfDay?: Record<TimeOfDay, number>;
  climate?: FragranceClimateProfile;

  /**
   * OLFACTUS multidimensional scent profile.
   */
  dna: Record<DnaDimension, number>;
  moods: string[];

  /**
   * Performance intelligence.
   */
  performance: FragrancePerformance;

  /**
   * Commercial context.
   */
  market?: FragranceMarketProfile;

  /**
   * Data quality and publishing status.
   */
  intelligenceStatus: IntelligenceStatus;
  intelligence?: FragranceIntelligenceMetadata;
}