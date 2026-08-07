import type { FragranceRecord } from "@/lib/domain/fragrance";

export type ImportedDataReadinessLevel =
  | "ready"
  | "partial"
  | "search-only"
  | "blocked";

export interface ImportedDataReadiness {
  level: ImportedDataReadinessLevel;
  score: number;
  label: string;
  explanation: string;
  missingFields: string[];
  allowsAdvancedScoring: boolean;
}

export function assessImportedFragranceReadiness(
  fragrance: FragranceRecord,
): ImportedDataReadiness {
  const missingFields: string[] = [];
  let score = 0;

  const add = (
    condition: boolean,
    points: number,
    field: string,
  ) => {
    if (condition) score += points;
    else missingFields.push(field);
  };

  add(Boolean(fragrance.name?.trim()), 15, "name");
  add(Boolean(fragrance.brand?.trim()), 15, "brand");
  add(Boolean(fragrance.concentration?.trim()), 8, "concentration");
  add(Boolean(fragrance.family?.trim() && fragrance.family !== "Unknown"), 8, "family");
  add(Boolean(fragrance.notes && [
    ...fragrance.notes.top,
    ...fragrance.notes.heart,
    ...fragrance.notes.base,
  ].length), 12, "notes");
  add(Boolean(fragrance.accords?.length), 8, "accords");
  add(Boolean(fragrance.roles?.length), 7, "roles");
  add(Boolean(fragrance.moods?.length), 5, "moods");
  add(Boolean(fragrance.releaseYear), 5, "releaseYear");
  add(Boolean(fragrance.perfumers?.length), 5, "perfumers");
  add(Boolean(
    fragrance.performance &&
    Number.isFinite(fragrance.performance.longevity) &&
    Number.isFinite(fragrance.performance.projection)
  ), 7, "performance");
  add(Boolean(
    fragrance.dna &&
    Object.values(fragrance.dna).every(Number.isFinite)
  ), 5, "dna");

  if (!fragrance.name || !fragrance.brand) {
    return {
      level: "blocked",
      score,
      label: "Blocked",
      explanation: "The record is missing its minimum identity fields.",
      missingFields,
      allowsAdvancedScoring: false,
    };
  }

  if (score >= 82) {
    return {
      level: "ready",
      score,
      label: "Ready",
      explanation: "Enough structured data is available for full intelligence workflows.",
      missingFields,
      allowsAdvancedScoring: true,
    };
  }

  if (score >= 58) {
    return {
      level: "partial",
      score,
      label: "Partial",
      explanation: "The record can participate with reduced-confidence intelligence.",
      missingFields,
      allowsAdvancedScoring: true,
    };
  }

  return {
    level: "search-only",
    score,
    label: "Search only",
    explanation: "The record is discoverable but excluded from authoritative advanced scoring.",
    missingFields,
    allowsAdvancedScoring: false,
  };
}
