import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  createCanonicalSlug,
  normalizeEntityName,
} from "@/lib/database/normalization";

export interface ImportRow {
  brand: string;
  name: string;
  concentration: string;
  family: string;
  releaseYear?: string | number;
  perfumers?: string | string[];
  countryOfOrigin?: string;
  accords?: string | string[];
  topNotes?: string | string[];
  heartNotes?: string | string[];
  baseNotes?: string | string[];
}

export interface ImportResult {
  records: FragranceRecord[];
  rejected: Array<{
    row: ImportRow;
    reasons: string[];
  }>;
}

export function importFragranceRows(
  rows: ImportRow[],
): ImportResult {
  const records:
    FragranceRecord[] = [];
  const rejected:
    ImportResult["rejected"] = [];

  for (const row of rows) {
    const reasons: string[] = [];

    if (!row.brand?.trim()) {
      reasons.push(
        "Brand is required.",
      );
    }
    if (!row.name?.trim()) {
      reasons.push(
        "Name is required.",
      );
    }
    if (!row.concentration?.trim()) {
      reasons.push(
        "Concentration is required.",
      );
    }
    if (!row.family?.trim()) {
      reasons.push(
        "Family is required.",
      );
    }

    if (reasons.length) {
      rejected.push({
        row,
        reasons,
      });
      continue;
    }

    records.push({
      id: createCanonicalSlug(
        row.brand,
        row.name,
        row.concentration,
      ),
      brand:
        normalizeEntityName(
          row.brand,
        ),
      name:
        normalizeEntityName(
          row.name,
        ),
      concentration:
        normalizeEntityName(
          row.concentration,
        ),
      releaseYear:
        parseYear(row.releaseYear),
      perfumers:
        splitList(row.perfumers),
      countryOfOrigin:
        row.countryOfOrigin
          ? normalizeEntityName(
              row.countryOfOrigin,
            )
          : undefined,
      family:
        normalizeEntityName(
          row.family,
        ),
      accords:
        splitList(row.accords),
      notes: {
        top:
          splitList(row.topNotes),
        heart:
          splitList(
            row.heartNotes,
          ),
        base:
          splitList(row.baseNotes),
      },
      roles: [],
      seasons: {
        spring: 50,
        summer: 50,
        fall: 50,
        winter: 50,
      },
      dna: {
        fresh: 50,
        green: 50,
        woody: 50,
        amber: 50,
        sweet: 50,
        dark: 50,
        artistic: 50,
        formal: 50,
      },
      moods: [],
      performance: {
        projection: 50,
        longevity: 50,
      },
      intelligenceStatus: "draft",
      intelligence: {
        confidence: 25,
        version:
          "GFD-import-1.0.0",
      },
    });
  }

  return {
    records,
    rejected,
  };
}

function splitList(
  value?: string | string[],
) {
  if (!value) return [];

  const values =
    Array.isArray(value)
      ? value
      : value.split(/[;,|]/);

  return [
    ...new Set(
      values
        .map(normalizeEntityName)
        .filter(Boolean),
    ),
  ];
}

function parseYear(
  value?: string | number,
) {
  if (value === undefined) {
    return undefined;
  }

  const year = Number(value);

  if (
    !Number.isInteger(year) ||
    year < 1700 ||
    year >
      new Date().getFullYear() + 1
  ) {
    return undefined;
  }

  return year;
}
