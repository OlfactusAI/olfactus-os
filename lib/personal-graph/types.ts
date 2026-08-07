export type PersonalGraphNodeType =
  | "collector"
  | "fragrance"
  | "family"
  | "accord"
  | "collector-dna"
  | "workspace"
  | "prediction";

export type PersonalGraphEdgeType =
  | "owns"
  | "wore"
  | "favorite"
  | "prefers"
  | "viewed"
  | "visited"
  | "simulated"
  | "predicted-signature"
  | "predicted-risk";

export interface PersonalGraphNode {
  id: string;
  type: PersonalGraphNodeType;
  label: string;
  globalEntityId?: string;
  confidence: number;
  metadata: Record<
    string,
    string | number | boolean | undefined
  >;
}

export interface PersonalGraphEdge {
  id: string;
  from: string;
  to: string;
  type: PersonalGraphEdgeType;
  weight: number;
  confidence: number;
  firstObservedAt?: string;
  lastObservedAt?: string;
  evidenceCount: number;
}

export interface PersonalIntelligenceGraph {
  schemaVersion: 1;
  graphVersion: "PIG-1.0.0";
  generatedAt: string;
  nodes: PersonalGraphNode[];
  edges: PersonalGraphEdge[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    fragranceNodeCount: number;
    preferenceEdgeCount: number;
  };
}
