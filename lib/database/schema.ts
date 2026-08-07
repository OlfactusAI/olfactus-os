import type {
  DnaDimension,
  FragranceRecord,
  FragranceRole,
  Season,
  TimeOfDay,
} from "@/lib/domain/fragrance";

export type DatabaseEntityStatus =
  | "draft"
  | "review"
  | "validated"
  | "deprecated";

export type AvailabilityStatus =
  | "widely-available"
  | "limited"
  | "discontinued"
  | "unknown";

export interface DatabaseSourceReference {
  id: string;
  sourceName: string;
  sourceUrl?: string;
  retrievedAt?: string;
  fields?: string[];
  confidence: number;
}

export interface BrandEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  countryCode?: string;
  foundedYear?: number;
  parentCompany?: string;
  website?: string;
  status: DatabaseEntityStatus;
  confidence: number;
  sources: DatabaseSourceReference[];
}

export interface PerfumerEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  countryCode?: string;
  birthYear?: number;
  biography?: string;
  status: DatabaseEntityStatus;
  confidence: number;
  sources: DatabaseSourceReference[];
}

export interface NoteEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  category:
    | "citrus"
    | "floral"
    | "fruit"
    | "green"
    | "spice"
    | "wood"
    | "resin"
    | "gourmand"
    | "animalic"
    | "synthetic"
    | "other";
  naturality:
    | "natural"
    | "synthetic"
    | "both"
    | "unknown";
  description?: string;
  confidence: number;
}

export interface AccordEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  description?: string;
  relatedNoteIds: string[];
  confidence: number;
}

export interface CountryEntity {
  code: string;
  canonicalName: string;
  region:
    | "Africa"
    | "Asia"
    | "Europe"
    | "Middle East"
    | "North America"
    | "Oceania"
    | "South America"
    | "Unknown";
}

export interface ConcentrationEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  approximateOilRange?: {
    minimum: number;
    maximum: number;
  };
}

export interface FragranceAssetReference {
  id: string;
  fragranceId: string;
  type:
    | "bottle"
    | "box"
    | "campaign"
    | "logo";
  sourcePath?: string;
  sourceUrl?: string;
  altText: string;
  verified: boolean;
  confidence: number;
}

export interface FragranceRatingAggregate {
  sourceId: string;
  score: number;
  scaleMaximum: number;
  voteCount?: number;
  observedAt?: string;
}

export interface FragranceRelationship {
  type:
    | "flanker-of"
    | "predecessor-of"
    | "successor-of"
    | "same-line"
    | "inspired-by"
    | "similar-to";
  fragranceId: string;
  confidence: number;
}

export interface GlobalFragranceRecord
  extends FragranceRecord {
  schemaVersion: "GFD-1.0.0";
  canonicalSlug: string;
  brandId: string;
  perfumerIds: string[];
  countryCode?: string;
  concentrationId: string;
  noteIds: {
    top: string[];
    heart: string[];
    base: string[];
  };
  accordIds: string[];
  relationships: FragranceRelationship[];
  ratings: FragranceRatingAggregate[];
  availability: AvailabilityStatus;
  assetIds: string[];
  popularityScore?: number;
  dataQualityScore: number;
  sources: DatabaseSourceReference[];
  updatedAt: string;
}

export interface GlobalFragranceDatabase {
  schemaVersion: "GFD-1.0.0";
  generatedAt: string;
  brands: BrandEntity[];
  perfumers: PerfumerEntity[];
  notes: NoteEntity[];
  accords: AccordEntity[];
  countries: CountryEntity[];
  concentrations: ConcentrationEntity[];
  assets: FragranceAssetReference[];
  fragrances: GlobalFragranceRecord[];
}

export interface FragranceSearchDocument {
  fragranceId: string;
  canonicalSlug: string;
  title: string;
  subtitle: string;
  searchableText: string;
  brand: string;
  family: string;
  concentration: string;
  releaseYear?: number;
  perfumers: string[];
  notes: string[];
  accords: string[];
  roles: FragranceRole[];
  seasons: Season[];
  timesOfDay: TimeOfDay[];
  availability: AvailabilityStatus;
  popularityScore: number;
  dataQualityScore: number;
  dna: Record<DnaDimension, number>;
}
