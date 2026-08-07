export type EntityType =
  | "fragrance"
  | "brand"
  | "perfumer"
  | "note"
  | "accord"
  | "family";

export interface EntityRelationship {
  id: string;
  type:
    | "created-by"
    | "made-by"
    | "contains-note"
    | "has-accord"
    | "belongs-to-family"
    | "offers-fragrance"
    | "created-fragrance"
    | "appears-in"
    | "similar-dna"
    | "same-family"
    | "shared-notes"
    | "shared-accords"
    | "same-perfumer"
    | "same-brand";
  sourceId: string;
  targetId: string;
  strength: number;
  confidence: number;
  explanation: string;
}

export interface RegisteredEntity {
  id: string;
  canonicalId: string;
  type: EntityType;
  slug: string;
  label: string;
  subtitle?: string;
  aliases: string[];
  confidence: number;
  status:
    | "draft"
    | "calibration"
    | "validated";
  metadata:
    Record<
      string,
      unknown
    >;
  relationships:
    EntityRelationship[];
}

export interface EntityRegistry {
  entities:
    RegisteredEntity[];
  byCanonicalId:
    Map<
      string,
      RegisteredEntity
    >;
  byLookup:
    Map<
      string,
      RegisteredEntity
    >;
  relationships:
    EntityRelationship[];
}
