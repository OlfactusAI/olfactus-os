import type {
  CollectionItem,
  CollectorProfile,
} from "@/lib/domain/collection";
import type {
  CollectorDnaTrait,
  MemoryInsight,
  MemoryQuerySummary,
} from "@/lib/memory/types";
import type {
  PredictiveSnapshot,
  PreferenceAffinity,
} from "@/lib/predictive/types";
import type {
  CollectionForecast,
} from "@/lib/prediction/prediction-types";
import type {
  CollectorEventDerivedState,
} from "@/lib/events/collector-event-reducer";
import type {
  ScoreProvenance,
} from "@/lib/intelligence-api/provenance";

export interface CanonicalFragranceOwnershipState {
  fragranceId: string;
  wearCount: number;
  memoryWearCount: number;
  daysSinceLastWear: number;
  personalRating?: number;
  favorite: boolean;
  purchasePrice?: number;
  fillLevelPercent?: number;
}

export interface CanonicalPreferenceState {
  families: PreferenceAffinity[];
  accords: PreferenceAffinity[];
  collectorDna: CollectorDnaTrait[];
}

export interface CanonicalBehaviorState {
  eventState: CollectorEventDerivedState;
  purchaseVelocitySignal:
    | "unknown"
    | "slow"
    | "moderate"
    | "fast";
  rotationStyle:
    | "unknown"
    | "concentrated"
    | "balanced"
    | "wide";
  recommendationAcceptanceRate?: number;
}

export interface CanonicalPredictionState {
  snapshot: PredictiveSnapshot;
  collectionForecast: CollectionForecast;
}

export interface CanonicalCollectorState {
  schemaVersion: 1;
  stateVersion: "COLLECTOR-STATE-1.0.0";
  generatedAt: string;
  profile: CollectorProfile;
  collection: CollectionItem[];
  ownership: CanonicalFragranceOwnershipState[];
  preferences: CanonicalPreferenceState;
  behavior: CanonicalBehaviorState;
  prediction: CanonicalPredictionState;
  memory: {
    summary: MemoryQuerySummary;
    insights: MemoryInsight[];
  };
  confidence: {
    overall: number;
    provenance: ScoreProvenance;
  };
}
