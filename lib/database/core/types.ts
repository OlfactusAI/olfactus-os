import type {
  AccordEntity,
  AvailabilityStatus,
  BrandEntity,
  ConcentrationEntity,
  CountryEntity,
  DatabaseSourceReference,
  FragranceAssetReference,
  FragranceRatingAggregate,
  GlobalFragranceRecord,
  NoteEntity,
  PerfumerEntity,
} from "@/lib/database/schema";

export type GlobalEntityType =
  | "fragrance"
  | "brand"
  | "perfumer"
  | "note"
  | "accord"
  | "concentration"
  | "country"
  | "ingredient"
  | "line";

export type GlobalRelationshipType =
  | "belongs-to-brand"
  | "created-by"
  | "contains-note"
  | "has-accord"
  | "has-concentration"
  | "originates-in"
  | "belongs-to-line"
  | "flanker-of"
  | "successor-of"
  | "predecessor-of"
  | "inspired-by"
  | "clone-of"
  | "similar-to"
  | "contains-ingredient";

export interface IngredientEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  category:
    | "natural"
    | "synthetic"
    | "hybrid"
    | "unknown";
  odorProfile: string[];
  originCountryCodes: string[];
  extractionMethods: string[];
  volatility:
    | "top"
    | "heart"
    | "base"
    | "multi-stage"
    | "unknown";
  relatedNoteIds: string[];
  confidence: number;
  sources: DatabaseSourceReference[];
}

export interface FragranceLineEntity {
  id: string;
  canonicalName: string;
  brandId: string;
  originalFragranceId?: string;
  memberFragranceIds: string[];
  status:
    | "active"
    | "discontinued"
    | "mixed"
    | "unknown";
  confidence: number;
  sources: DatabaseSourceReference[];
}

export interface GlobalRelationship {
  id: string;
  sourceType: GlobalEntityType;
  sourceId: string;
  targetType: GlobalEntityType;
  targetId: string;
  type: GlobalRelationshipType;
  strength: number;
  confidence: number;
  metadata?: Record<
    string,
    string | number | boolean | string[]
  >;
  sources: DatabaseSourceReference[];
}

export interface GlobalDatabaseSnapshot {
  schemaVersion: "GFD-2.0.0";
  generatedAt: string;
  datasetId: string;
  datasetVersion: string;
  fragrances: GlobalFragranceRecord[];
  brands: BrandEntity[];
  perfumers: PerfumerEntity[];
  notes: NoteEntity[];
  accords: AccordEntity[];
  concentrations: ConcentrationEntity[];
  countries: CountryEntity[];
  ingredients: IngredientEntity[];
  lines: FragranceLineEntity[];
  relationships: GlobalRelationship[];
  assets: FragranceAssetReference[];
  ratings: FragranceRatingAggregate[];
  metadata: {
    fragranceCount: number;
    brandCount: number;
    perfumerCount: number;
    noteCount: number;
    accordCount: number;
    ingredientCount: number;
    lineCount: number;
    relationshipCount: number;
    availableCount: Record<AvailabilityStatus, number>;
  };
}

export interface GlobalDatabaseIndex {
  fragranceById: Map<string, GlobalFragranceRecord>;
  brandById: Map<string, BrandEntity>;
  perfumerById: Map<string, PerfumerEntity>;
  noteById: Map<string, NoteEntity>;
  accordById: Map<string, AccordEntity>;
  concentrationById: Map<string, ConcentrationEntity>;
  countryByCode: Map<string, CountryEntity>;
  ingredientById: Map<string, IngredientEntity>;
  lineById: Map<string, FragranceLineEntity>;
  relationshipsBySource: Map<string, GlobalRelationship[]>;
  relationshipsByTarget: Map<string, GlobalRelationship[]>;
}
