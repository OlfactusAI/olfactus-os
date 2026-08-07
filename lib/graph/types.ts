import type {
  DnaDimension,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";

export type KnowledgeNodeType =
  | "fragrance"
  | "brand"
  | "perfumer"
  | "note"
  | "accord"
  | "family"
  | "role"
  | "season"
  | "dna"
  | "lineage"
  | "collection"
  | "market"
  | "recommendation"
  | "timeline-event";

export type KnowledgeEdgeType =
  | "belongs-to-brand"
  | "created-by"
  | "contains-note"
  | "has-accord"
  | "belongs-to-family"
  | "fits-role"
  | "best-in-season"
  | "expresses-dna"
  | "similar-to"
  | "complements"
  | "high-overlap"
  | "belongs-to-lineage"
  | "lineage-parent"
  | "lineage-successor"
  | "lineage-clone"
  | "lineage-inspired-by"
  | "same-lineage"
  | "owned-in-collection"
  | "has-market-signal"
  | "recommended-by"
  | "recorded-in-timeline"
  | "competes-with";

export interface KnowledgeGraphNode {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  subtitle?: string;
  fragranceId?: string;
  brand?: string;
  family?: string;
  owned?: boolean;
  candidate?: boolean;
  score?: number;
  metadata?: Record<
    string,
    string | number | boolean | string[]
  >;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: KnowledgeEdgeType;
  strength: number;
  explanation: string;
}

export interface KnowledgeGraphCluster {
  id: string;
  label: string;
  nodeIds: string[];
  dominantDna: DnaDimension[];
  averageStrength: number;
}

export interface KnowledgeGraph {
  version: "KGE-1.0.0";
  generatedAt: string;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  clusters: KnowledgeGraphCluster[];
}

export interface RelationshipBreakdown {
  dnaSimilarity: number;
  roleSimilarity: number;
  seasonalSimilarity: number;
  familySimilarity: number;
  performanceSimilarity: number;
  overall: number;
}

export interface BridgeFragrance {
  fragranceId: string;
  fragranceName: string;
  bridgeScore: number;
  clusterConnections: string[];
}

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  fragranceCount: number;
  averageRelationshipStrength: number;
  mostConnectedNodeId: string | null;
  strongestBridge: BridgeFragrance | null;
  largestCluster: KnowledgeGraphCluster | null;
  connectivity: number;
}

export interface GraphQuery {
  text?: string;
  nodeTypes?: KnowledgeNodeType[];
  ownedOnly?: boolean;
  roles?: FragranceRole[];
  seasons?: Season[];
  minimumStrength?: number;
}
