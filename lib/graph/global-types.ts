export type GlobalEntityType =
  | "fragrance" | "brand" | "perfumer" | "ingredient" | "accord"
  | "company" | "country" | "collection" | "family" | "dna-family"
  | "clone-family" | "retailer" | "award";

export type GlobalRelationshipType =
  | "belongs-to-brand" | "created-by" | "uses-ingredient" | "uses-accord"
  | "belongs-to-family" | "owned-by-company" | "originates-in"
  | "part-of-collection" | "shares-dna" | "inspired-by" | "clone-of"
  | "similar-to" | "competes-with" | "successor-of" | "predecessor-of"
  | "more-intense-than" | "more-fresh-than" | "more-formal-than";

export interface GlobalGraphEntity {
  id: string;
  canonicalId: string;
  type: GlobalEntityType;
  name: string;
  aliases: string[];
  confidence: number;
  status: "draft" | "calibration" | "validated";
  metadata: Record<string, string | number | boolean | string[] | undefined>;
}

export interface GlobalGraphRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: GlobalRelationshipType;
  weight: number;
  confidence: number;
  explanation: string;
  source: "catalog" | "calculated" | "import" | "curated";
}

export interface GlobalIntelligenceGraph {
  graphVersion: "GIN-1.0.0";
  generatedAt: string;
  entities: GlobalGraphEntity[];
  relationships: GlobalGraphRelationship[];
}

export interface GlobalGraphMetrics {
  graphVersion: "GIN-1.0.0";
  entityCount: number;
  relationshipCount: number;
  entityTypeCount: number;
  relationshipTypeCount: number;
  averageDegree: number;
  density: number;
  connectedComponents: number;
  largestConnectedComponent: number;
  orphanCount: number;
  integrityScore: number;
}

export interface GlobalGraphPath {
  found: boolean;
  nodeIds: string[];
  relationshipIds: string[];
  distance: number;
}

export interface GlobalGraphNeighbor {
  entity: GlobalGraphEntity;
  relationship: GlobalGraphRelationship;
  direction: "outgoing" | "incoming";
}
