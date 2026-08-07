import type {
  DnaDimension,
  FragranceRole,
} from "@/lib/domain/fragrance";

export interface EvolutionSnapshot {
  id: string;
  createdAt: string;
  source:
    | "automatic"
    | "manual"
    | "purchase"
    | "baseline";
  captureReason:
    | "tracking-started"
    | "collection-changed"
    | "wear-milestone"
    | "manual-capture"
    | "purchase-impact"
    | "annual-review"
    | "imported-history";
  collectionSize: number;
  totalWears: number;
  collectionHealth: number;
  roleCoverage: number;
  seasonalBalance: number;
  diversity: number;
  redundancy: number;
  rotation: number;
  identity: number;
  dna: Record<DnaDimension, number>;
  roles: Record<FragranceRole, number>;
  brands: Record<string, number>;
  families: Record<string, number>;
  ownedFragranceIds: string[];
}

export interface EvolutionLedger {
  schemaVersion: 1;
  createdAt: string;
  snapshots: EvolutionSnapshot[];
}

export interface EvolutionDelta {
  metric: string;
  before: number;
  after: number;
  change: number;
  direction:
    | "up"
    | "down"
    | "unchanged";
}

export interface EvolutionMilestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
  progress: number;
}

export interface PurchaseImpactAnalysis {
  fragranceId: string;
  beforeSnapshotId: string;
  afterSnapshotId: string;
  collectionHealthChange: number;
  diversityChange: number;
  redundancyChange: number;
  roleCoverageChange: number;
  strongestDnaChange: {
    dimension: DnaDimension;
    change: number;
  };
  addedRoles: FragranceRole[];
  addedBrand?: string;
  addedFamily?: string;
  summary: string;
}

export interface CollectionEvolutionOutput {
  modelVersion: "CEE-1.0.0";
  generatedAt: string;
  snapshotCount: number;
  firstSnapshot: EvolutionSnapshot | null;
  latestSnapshot: EvolutionSnapshot | null;
  healthChange: number;
  diversityChange: number;
  rotationChange: number;
  roleCoverageChange: number;
  strongestRisingDna: {
    dimension: DnaDimension;
    change: number;
  } | null;
  strongestFallingDna: {
    dimension: DnaDimension;
    change: number;
  } | null;
  dominantBrandShift: {
    before?: string;
    after?: string;
  };
  dominantFamilyShift: {
    before?: string;
    after?: string;
  };
  milestones: EvolutionMilestone[];
  briefing: string;
  metricDeltas: EvolutionDelta[];
}
