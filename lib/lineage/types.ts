import type {
  DnaDimension,
} from "@/lib/domain/fragrance";

export type LineageRelationshipType =
  | "original"
  | "flanker"
  | "successor"
  | "predecessor"
  | "limited-edition"
  | "reformulation"
  | "clone"
  | "inspired-by";

export type LineageReleaseStatus =
  | "active"
  | "limited"
  | "discontinued"
  | "unknown";

export interface LineageMetadata {
  fragranceId: string;
  lineId: string;
  parentId?: string;
  generation: number;
  releaseOrder: number;
  relationship:
    LineageRelationshipType;
  status: LineageReleaseStatus;
  concentrationId?: string;
  successorId?: string;
  predecessorId?: string;
  inspiredByIds?: string[];
  cloneOfIds?: string[];
  confidence: number;
  source:
    | "curated"
    | "imported"
    | "inferred";
}

export interface FragranceLineDefinition {
  id: string;
  canonicalName: string;
  brandId: string;
  originalFragranceId: string;
  memberIds: string[];
  confidence: number;
  source:
    | "curated"
    | "imported"
    | "inferred";
}

export interface LineageDnaDelta {
  dimension: DnaDimension;
  original: number;
  current: number;
  delta: number;
}

export interface LineagePerformanceDelta {
  longevity: number;
  projection: number;
  sillage: number | null;
}

export interface LineageNode {
  fragranceId: string;
  lineId: string;
  parentId?: string;
  generation: number;
  releaseOrder: number;
  releaseYear?: number;
  relationship:
    LineageRelationshipType;
  status: LineageReleaseStatus;
  concentrationId: string;
  dnaInheritance: number;
  evolutionScore: number;
  originalityScore: number;
  performanceDelta:
    LineagePerformanceDelta;
  dnaDeltas: LineageDnaDelta[];
  children: string[];
  successorId?: string;
  predecessorId?: string;
  inspiredByIds: string[];
  cloneOfIds: string[];
  confidence: number;
}

export interface FragranceLine {
  id: string;
  canonicalName: string;
  brandId: string;
  originalFragranceId: string;
  members: LineageNode[];
  chronology: string[];
  activeMemberIds: string[];
  discontinuedMemberIds: string[];
  averageInheritance: number;
  averageEvolution: number;
  confidence: number;
}

export interface LineageGraphEdge {
  sourceId: string;
  targetId: string;
  type:
    | "parent-child"
    | "successor"
    | "predecessor"
    | "clone"
    | "inspired-by"
    | "same-line";
  confidence: number;
}

export interface LineageIntelligenceOutput {
  modelVersion: "LIE-1.0.0";
  generatedAt: string;
  lines: FragranceLine[];
  nodes: LineageNode[];
  edges: LineageGraphEdge[];
  orphanFragranceIds: string[];
}
