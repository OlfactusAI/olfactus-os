export type TimelineEventType =
  | "baseline_created"
  | "bottle_added"
  | "bottle_removed"
  | "wear_logged"
  | "favorite_changed"
  | "collection_health_updated"
  | "genome_snapshot"
  | "coach_action_completed"
  | "decision_completed"
  | "deal_analyzed"
  | "evolution_snapshot"
  | "annual_review_generated"
  | "purchase_skipped"
  | "profile_updated"
  | "sample_added"
  | "decant_added"
  | "bottle_finished"
  | "bottle_upgraded"
  | "repurchased"
  | "milestone_reached"
  | "collection_value_updated"
  | "simulation_applied";

export interface TimelineMetricSnapshot {
  collectionHealth: number;
  rotation: number;
  diversity: number;
  seasonalBalance: number;
  redundancy: number;
  totalWears: number;
  bottleCount: number;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  summary: string;
  fragranceId?: string;
  fragranceName?: string;
  metadata?: Record<string, string | number | boolean>;
  snapshot?: TimelineMetricSnapshot;
}

export interface TimelineLedger {
  schemaVersion: 1;
  createdAt: string;
  events: TimelineEvent[];
}
