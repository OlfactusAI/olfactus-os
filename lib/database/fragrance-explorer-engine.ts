import type {
  DatabaseSearchFilters,
  DatabaseSearchResult,
} from "@/lib/database/search-index";
import type {
  FragranceSearchDocument,
  GlobalFragranceDatabase,
  GlobalFragranceRecord,
} from "@/lib/database/schema";
import {
  searchGlobalFragranceDatabase,
} from "@/lib/database/search-index";

export type ExplorerSort =
  | "relevance"
  | "quality"
  | "longevity"
  | "projection"
  | "newest"
  | "name";

export interface ExplorerFilters
  extends DatabaseSearchFilters {
  brand?: string;
  family?: string;
  concentration?: string;
  availabilityStatus?: string;
  minimumLongevity?: number;
  minimumProjection?: number;
  minimumFreshDna?: number;
  minimumArtisticDna?: number;
  role?: string;
  season?: string;
}

export interface ExplorerResult
  extends DatabaseSearchResult {
  whyMatched: string[];
  owned: boolean;
}

export function searchFragranceExplorer({
  database,
  index,
  query,
  filters,
  sort,
  ownedIds,
  limit = 60,
}: {
  database: GlobalFragranceDatabase;
  index: FragranceSearchDocument[];
  query: string;
  filters: ExplorerFilters;
  sort: ExplorerSort;
  ownedIds: Set<string>;
  limit?: number;
}): ExplorerResult[] {
  const baseFilters: DatabaseSearchFilters = {
    brands:
      filters.brand
        ? [filters.brand]
        : undefined,
    families:
      filters.family
        ? [filters.family]
        : undefined,
    concentrations:
      filters.concentration
        ? [filters.concentration]
        : undefined,
    availability:
      filters.availabilityStatus
        ? [filters.availabilityStatus]
        : undefined,
    minimumDataQuality:
      filters.minimumDataQuality,
    releaseYearMinimum:
      filters.releaseYearMinimum,
    releaseYearMaximum:
      filters.releaseYearMaximum,
  };

  const results =
    searchGlobalFragranceDatabase({
      database,
      index,
      query,
      filters: baseFilters,
      limit: Math.max(
        limit,
        database.fragrances.length,
      ),
    })
      .filter(({ fragrance }) =>
        matchesAdvancedFilters(
          fragrance,
          filters,
        ),
      )
      .map((result) => ({
        ...result,
        whyMatched:
          buildWhyMatched({
            result,
            query,
            filters,
          }),
        owned: ownedIds.has(
          result.fragrance.id,
        ),
      }));

  return sortResults(
    results,
    sort,
  ).slice(0, limit);
}

export function getRelatedExplorerFragrances({
  candidate,
  database,
  limit = 6,
}: {
  candidate: GlobalFragranceRecord;
  database: GlobalFragranceDatabase;
  limit?: number;
}) {
  return database.fragrances
    .filter(
      (fragrance) =>
        fragrance.id !== candidate.id,
    )
    .map((fragrance) => ({
      fragrance,
      score: relatedScore(
        candidate,
        fragrance,
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.fragrance.name.localeCompare(
          b.fragrance.name,
        ),
    )
    .slice(0, limit);
}

function matchesAdvancedFilters(
  fragrance: GlobalFragranceRecord,
  filters: ExplorerFilters,
) {
  if (
    filters.minimumLongevity &&
    fragrance.performance.longevity <
      filters.minimumLongevity
  ) {
    return false;
  }

  if (
    filters.minimumProjection &&
    fragrance.performance.projection <
      filters.minimumProjection
  ) {
    return false;
  }

  if (
    filters.minimumFreshDna &&
    fragrance.dna.fresh <
      filters.minimumFreshDna
  ) {
    return false;
  }

  if (
    filters.minimumArtisticDna &&
    fragrance.dna.artistic <
      filters.minimumArtisticDna
  ) {
    return false;
  }

  if (
    filters.role &&
    !fragrance.roles.includes(
      filters.role as never,
    )
  ) {
    return false;
  }

  if (
    filters.season &&
    fragrance.seasons[
      filters.season as keyof typeof fragrance.seasons
    ] < 65
  ) {
    return false;
  }

  return true;
}

function buildWhyMatched({
  result,
  query,
  filters,
}: {
  result: DatabaseSearchResult;
  query: string;
  filters: ExplorerFilters;
}) {
  const reasons = [
    ...result.matchedFields.map(
      (field) =>
        `${capitalize(field)} match`,
    ),
  ];

  if (
    filters.role &&
    result.fragrance.roles.includes(
      filters.role as never,
    )
  ) {
    reasons.push(
      `${capitalize(filters.role)} role`,
    );
  }

  if (
    filters.season &&
    result.fragrance.seasons[
      filters.season as keyof typeof result.fragrance.seasons
    ] >= 65
  ) {
    reasons.push(
      `${capitalize(filters.season)} strength`,
    );
  }

  if (
    filters.minimumLongevity &&
    result.fragrance.performance
      .longevity >=
      filters.minimumLongevity
  ) {
    reasons.push(
      `Longevity ${result.fragrance.performance.longevity}`,
    );
  }

  if (
    filters.minimumProjection &&
    result.fragrance.performance
      .projection >=
      filters.minimumProjection
  ) {
    reasons.push(
      `Projection ${result.fragrance.performance.projection}`,
    );
  }

  if (
    filters.minimumFreshDna &&
    result.fragrance.dna.fresh >=
      filters.minimumFreshDna
  ) {
    reasons.push(
      `Fresh DNA ${result.fragrance.dna.fresh}`,
    );
  }

  if (
    filters.minimumArtisticDna &&
    result.fragrance.dna.artistic >=
      filters.minimumArtisticDna
  ) {
    reasons.push(
      `Artistic DNA ${result.fragrance.dna.artistic}`,
    );
  }

  if (!reasons.length && !query.trim()) {
    reasons.push(
      `Data quality ${result.fragrance.dataQualityScore}`,
    );
  }

  return [...new Set(reasons)].slice(0, 4);
}

function sortResults(
  results: ExplorerResult[],
  sort: ExplorerSort,
) {
  return [...results].sort(
    (a, b) => {
      if (sort === "quality") {
        return (
          b.fragrance.dataQualityScore -
          a.fragrance.dataQualityScore
        );
      }
      if (sort === "longevity") {
        return (
          b.fragrance.performance
            .longevity -
          a.fragrance.performance
            .longevity
        );
      }
      if (sort === "projection") {
        return (
          b.fragrance.performance
            .projection -
          a.fragrance.performance
            .projection
        );
      }
      if (sort === "newest") {
        return (
          (b.fragrance.releaseYear ?? 0) -
          (a.fragrance.releaseYear ?? 0)
        );
      }
      if (sort === "name") {
        return a.fragrance.name.localeCompare(
          b.fragrance.name,
        );
      }
      return (
        b.score - a.score ||
        a.fragrance.name.localeCompare(
          b.fragrance.name,
        )
      );
    },
  );
}

function relatedScore(
  first: GlobalFragranceRecord,
  second: GlobalFragranceRecord,
) {
  let score = 0;

  if (
    first.family === second.family
  ) {
    score += 30;
  }

  score +=
    overlap(
      first.accordIds,
      second.accordIds,
    ) * 8;
  score +=
    overlap(
      [
        ...first.noteIds.top,
        ...first.noteIds.heart,
        ...first.noteIds.base,
      ],
      [
        ...second.noteIds.top,
        ...second.noteIds.heart,
        ...second.noteIds.base,
      ],
    ) * 5;
  score +=
    overlap(
      first.roles,
      second.roles,
    ) * 4;

  score += Math.max(
    0,
    25 -
      Math.round(
        Math.abs(
          first.dna.fresh -
            second.dna.fresh,
        ) /
          4,
      ) -
      Math.round(
        Math.abs(
          first.dna.artistic -
            second.dna.artistic,
        ) /
          4,
      ),
  );

  return score;
}

function overlap(
  first: readonly string[],
  second: readonly string[],
) {
  const secondSet = new Set(second);
  return first.filter((value) =>
    secondSet.has(value),
  ).length;
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}
