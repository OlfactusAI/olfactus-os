import type {
  DnaDimension,
  FragranceRole,
} from "@/lib/domain/fragrance";

export type CollectionForecastHorizon =
  | "now"
  | "30d"
  | "90d"
  | "6m"
  | "1y";

export type BottleFutureState =
  | "core-rotation"
  | "stable"
  | "watch"
  | "neglect-risk"
  | "seasonal-hold"
  | "signature-candidate"
  | "emerging-favorite"
  | "removal-candidate"
  | "likely-repurchase"
  | "archive";

export interface ForecastRange {
  center: number;
  low: number;
  high: number;
}

export interface ForecastDriver {
  kind:
    | "positive"
    | "risk";
  title: string;
  detail: string;
  impact: number;
}

export interface BottleFutureForecast {
  fragranceId: string;
  fragranceName: string;
  brand: string;
  state:
    BottleFutureState;
  confidence: number;
  projectedDaysSinceLastWear: number;
  estimatedWearsPerMonth: number;
  retentionRisk: number;
  signaturePotential: number;
  reason: string;
}

export interface DnaForecastPoint {
  dimension:
    DnaDimension;
  share: number;
  currentShare: number;
  delta: number;
}

export interface RoleForecast {
  role:
    FragranceRole;
  status:
    | "covered"
    | "emerging-gap"
    | "likely-gap";
  activeBottleCount: number;
  confidence: number;
}

export interface ForecastMilestone {
  id: string;
  title: string;
  detail: string;
  confidence: number;
  category:
    | "health"
    | "rotation"
    | "signature"
    | "role"
    | "collection";
}

export interface CollectionForecastPoint {
  horizon:
    CollectionForecastHorizon;
  label: string;
  days: number;
  confidence: number;
  health:
    ForecastRange & {
      trend:
        | "improving"
        | "stable"
        | "declining";
    };
  rotation: number;
  diversity: number;
  redundancy: number;
  seasonalBalance: number;
  activeRotation: number;
  neglectedCount: number;
  signatureStability: number;
  bottleStates:
    BottleFutureForecast[];
  dna:
    DnaForecastPoint[];
  roles:
    RoleForecast[];
  milestones:
    ForecastMilestone[];
  drivers:
    ForecastDriver[];
}

export interface CollectionForecast {
  modelVersion:
    "CF-3.2.0-alpha.1";
  currentHealth: number;
  overallConfidence: number;
  evidenceEvents: number;
  points:
    CollectionForecastPoint[];
  strongestFutureSignal?: string;
  nextLikelyRoleGap?: string;
}
