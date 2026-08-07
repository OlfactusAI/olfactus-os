import type {
  UniversalSearchDocument,
  UniversalSearchEntityType,
} from "@/lib/search/types";

const recentQueryKey =
  "olfactus.search.recent-queries.v1";
const recentEntityKey =
  "olfactus.search.recent-entities.v1";

export interface RecentSearchEntity {
  id: string;
  entityType:
    UniversalSearchEntityType;
  label: string;
  subtitle?: string;
  route: string;
  openedAt: string;
}

export function loadRecentSearchQueries() {
  return readStorage<string[]>(
    recentQueryKey,
    [],
  );
}

export function saveRecentSearchQuery(
  query: string,
) {
  const normalized =
    query.trim();

  if (!normalized) return;

  const current =
    loadRecentSearchQueries();
  const next = [
    normalized,
    ...current.filter(
      (item) =>
        item.toLowerCase() !==
        normalized.toLowerCase(),
    ),
  ].slice(0, 8);

  writeStorage(
    recentQueryKey,
    next,
  );
}

export function loadRecentSearchEntities() {
  return readStorage<
    RecentSearchEntity[]
  >(
    recentEntityKey,
    [],
  );
}

export function saveRecentSearchEntity(
  document:
    UniversalSearchDocument,
) {
  const current =
    loadRecentSearchEntities();
  const next: RecentSearchEntity[] = [
    {
      id: document.id,
      entityType:
        document.entityType,
      label: document.label,
      subtitle:
        document.subtitle,
      route: document.route,
      openedAt:
        new Date().toISOString(),
    },
    ...current.filter(
      (item) =>
        item.id !==
        document.id,
    ),
  ].slice(0, 8);

  writeStorage(
    recentEntityKey,
    next,
  );
}

export function clearUniversalSearchHistory() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    recentQueryKey,
  );
  window.localStorage.removeItem(
    recentEntityKey,
  );
}

function readStorage<Value>(
  key: string,
  fallback: Value,
): Value {
  if (
    typeof window ===
    "undefined"
  ) {
    return fallback;
  }

  try {
    const raw =
      window.localStorage.getItem(
        key,
      );

    return raw
      ? (JSON.parse(raw) as Value)
      : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(
  key: string,
  value: unknown,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify(value),
  );
}
