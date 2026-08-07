import type {
  FragranceSearchDocument,
  GlobalFragranceDatabase,
  GlobalFragranceRecord,
} from "@/lib/database/schema";
import {
  normalizeEntityName,
} from "@/lib/database/normalization";

export interface DatabaseSearchFilters {
  brands?: string[];
  families?: string[];
  concentrations?: string[];
  perfumers?: string[];
  notes?: string[];
  accords?: string[];
  availability?: string[];
  releaseYearMinimum?: number;
  releaseYearMaximum?: number;
  minimumDataQuality?: number;
}

export interface DatabaseSearchResult {
  fragrance: GlobalFragranceRecord;
  score: number;
  matchedFields: string[];
}

export function buildFragranceSearchIndex(
  database: GlobalFragranceDatabase,
): FragranceSearchDocument[] {
  const brandById = new Map(
    database.brands.map(
      (brand) => [
        brand.id,
        brand.canonicalName,
      ],
    ),
  );
  const perfumerById = new Map(
    database.perfumers.map(
      (perfumer) => [
        perfumer.id,
        perfumer.canonicalName,
      ],
    ),
  );
  const noteById = new Map(
    database.notes.map(
      (note) => [
        note.id,
        note.canonicalName,
      ],
    ),
  );
  const accordById = new Map(
    database.accords.map(
      (accord) => [
        accord.id,
        accord.canonicalName,
      ],
    ),
  );

  return database.fragrances.map(
    (fragrance) => {
      const perfumers =
        fragrance.perfumerIds.map(
          (id) =>
            perfumerById.get(id) ??
            id,
        );
      const notes = [
        ...fragrance.noteIds.top,
        ...fragrance.noteIds.heart,
        ...fragrance.noteIds.base,
      ].map(
        (id) =>
          noteById.get(id) ?? id,
      );
      const accords =
        fragrance.accordIds.map(
          (id) =>
            accordById.get(id) ??
            id,
        );

      return {
        fragranceId: fragrance.id,
        canonicalSlug:
          fragrance.canonicalSlug,
        title: fragrance.name,
        subtitle: `${
          brandById.get(
            fragrance.brandId,
          ) ?? fragrance.brand
        } · ${fragrance.concentration}`,
        searchableText:
          normalizeEntityName(
            [
              fragrance.name,
              fragrance.brand,
              fragrance.family,
              fragrance.subfamily,
              fragrance.concentration,
              ...perfumers,
              ...notes,
              ...accords,
              ...fragrance.moods,
              ...fragrance.roles,
            ]
              .filter(Boolean)
              .join(" "),
          ).toLowerCase(),
        brand: fragrance.brand,
        family: fragrance.family,
        concentration:
          fragrance.concentration,
        releaseYear:
          fragrance.releaseYear,
        perfumers,
        notes,
        accords,
        roles: fragrance.roles,
        seasons:
          Object.entries(
            fragrance.seasons,
          )
            .filter(
              ([, value]) =>
                value >= 65,
            )
            .map(
              ([season]) =>
                season,
            ) as FragranceSearchDocument["seasons"],
        timesOfDay:
          Object.entries(
            fragrance.timesOfDay ?? {},
          )
            .filter(
              ([, value]) =>
                value >= 65,
            )
            .map(
              ([time]) =>
                time,
            ) as FragranceSearchDocument["timesOfDay"],
        availability:
          fragrance.availability,
        popularityScore:
          fragrance.popularityScore ??
          0,
        dataQualityScore:
          fragrance.dataQualityScore,
        dna: fragrance.dna,
      };
    },
  );
}

export function searchGlobalFragranceDatabase({
  database,
  index,
  query,
  filters = {},
  limit = 24,
}: {
  database: GlobalFragranceDatabase;
  index: FragranceSearchDocument[];
  query: string;
  filters?: DatabaseSearchFilters;
  limit?: number;
}): DatabaseSearchResult[] {
  const normalizedQuery =
    normalizeEntityName(query)
      .toLowerCase();
  const terms =
    normalizedQuery
      .split(" ")
      .filter(Boolean);

  return index
    .filter((document) =>
      matchesFilters(
        document,
        filters,
      ),
    )
    .map((document) => {
      const matchedFields:
        string[] = [];
      let score =
        document.popularityScore *
          0.08 +
        document.dataQualityScore *
          0.05;

      if (!terms.length) {
        score += 10;
      }

      for (const term of terms) {
        if (
          document.title
            .toLowerCase()
            .includes(term)
        ) {
          score += 35;
          matchedFields.push("name");
        }
        if (
          document.brand
            .toLowerCase()
            .includes(term)
        ) {
          score += 24;
          matchedFields.push("brand");
        }
        if (
          document.perfumers.some(
            (value) =>
              value
                .toLowerCase()
                .includes(term),
          )
        ) {
          score += 20;
          matchedFields.push(
            "perfumer",
          );
        }
        if (
          document.notes.some(
            (value) =>
              value
                .toLowerCase()
                .includes(term),
          )
        ) {
          score += 14;
          matchedFields.push("note");
        }
        if (
          document.accords.some(
            (value) =>
              value
                .toLowerCase()
                .includes(term),
          )
        ) {
          score += 12;
          matchedFields.push("accord");
        }
        if (
          document.searchableText.includes(
            term,
          )
        ) {
          score += 5;
        }
      }

      return {
        fragrance:
          database.fragrances.find(
            (fragrance) =>
              fragrance.id ===
              document.fragranceId,
          )!,
        score: Math.round(score),
        matchedFields: [
          ...new Set(matchedFields),
        ],
      };
    })
    .filter(
      (result) =>
        Boolean(result.fragrance) &&
        (terms.length === 0 ||
          result.score > 10),
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.fragrance.name.localeCompare(
          b.fragrance.name,
        ),
    )
    .slice(0, limit);
}

function matchesFilters(
  document: FragranceSearchDocument,
  filters: DatabaseSearchFilters,
) {
  if (
    filters.brands?.length &&
    !filters.brands.includes(
      document.brand,
    )
  ) {
    return false;
  }

  if (
    filters.families?.length &&
    !filters.families.includes(
      document.family,
    )
  ) {
    return false;
  }

  if (
    filters.concentrations?.length &&
    !filters.concentrations.includes(
      document.concentration,
    )
  ) {
    return false;
  }

  if (
    filters.perfumers?.length &&
    !filters.perfumers.some(
      (value) =>
        document.perfumers.includes(
          value,
        ),
    )
  ) {
    return false;
  }

  if (
    filters.notes?.length &&
    !filters.notes.some(
      (value) =>
        document.notes.includes(value),
    )
  ) {
    return false;
  }

  if (
    filters.accords?.length &&
    !filters.accords.some(
      (value) =>
        document.accords.includes(value),
    )
  ) {
    return false;
  }

  if (
    filters.availability?.length &&
    !filters.availability.includes(
      document.availability,
    )
  ) {
    return false;
  }

  if (
    filters.releaseYearMinimum &&
    (!document.releaseYear ||
      document.releaseYear <
        filters.releaseYearMinimum)
  ) {
    return false;
  }

  if (
    filters.releaseYearMaximum &&
    (!document.releaseYear ||
      document.releaseYear >
        filters.releaseYearMaximum)
  ) {
    return false;
  }

  if (
    filters.minimumDataQuality &&
    document.dataQualityScore <
      filters.minimumDataQuality
  ) {
    return false;
  }

  return true;
}
