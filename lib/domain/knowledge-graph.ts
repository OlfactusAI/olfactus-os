export type KnowledgeNodeType =
  | "fragrance"
  | "brand"
  | "perfumer"
  | "family"
  | "accord"
  | "note"
  | "role"
  | "season"
  | "climate"
  | "mood"
  | "country";

export type KnowledgeRelationType =
  | "made-by"
  | "created-by"
  | "belongs-to-family"
  | "has-accord"
  | "has-note"
  | "supports-role"
  | "suited-for-season"
  | "suited-for-climate"
  | "expresses-mood"
  | "originates-from"
  | "similar-to"
  | "complements"
  | "overlaps-with";

export interface KnowledgeNode {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface KnowledgeEdge {
  id: string;
  from: string;
  to: string;
  relation: KnowledgeRelationType;

  /**
   * Relationship confidence or strength on a 0–100 scale.
   */
  weight: number;

  evidence?: string[];
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  version: string;
  generatedAt: string;
}

export interface GraphNeighbor {
  node: KnowledgeNode;
  edge: KnowledgeEdge;
}

export interface GraphPath {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  totalWeight: number;
}