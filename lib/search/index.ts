export {
  buildUniversalSearchIndex,
} from "@/lib/search/index-builder";
export {
  levenshteinDistance,
  searchUniversalIndex,
} from "@/lib/search/engine";
export {
  normalizeSearchText,
  tokenizeSearchText,
  uniqueSearchValues,
} from "@/lib/search/normalization";
export type {
  UniversalSearchDocument,
  UniversalSearchEntityType,
  UniversalSearchGroup,
  UniversalSearchHit,
  UniversalSearchIndex,
  UniversalSearchOptions,
  UniversalSearchResult,
} from "@/lib/search/types";

export {
  clearUniversalSearchHistory,
  loadRecentSearchEntities,
  loadRecentSearchQueries,
  saveRecentSearchEntity,
  saveRecentSearchQuery,
} from "@/lib/search/storage";
export type {
  RecentSearchEntity,
} from "@/lib/search/storage";
