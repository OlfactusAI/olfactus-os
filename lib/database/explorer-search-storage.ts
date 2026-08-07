"use client";

export const EXPLORER_SEARCH_STORAGE_KEY =
  "olfactus.explorer.searches.v1";

export interface SavedExplorerSearch {
  id: string;
  label: string;
  query: string;
  createdAt: string;
  filters: {
    brand?: string;
    family?: string;
    concentration?: string;
    availability?: string;
    minimumQuality?: number;
    minimumLongevity?: number;
    minimumProjection?: number;
  };
}

export function readSavedExplorerSearches():
  SavedExplorerSearch[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(
      EXPLORER_SEARCH_STORAGE_KEY,
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSavedExplorerSearches(
  searches: SavedExplorerSearch[],
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    EXPLORER_SEARCH_STORAGE_KEY,
    JSON.stringify(searches.slice(0, 30)),
  );
  window.dispatchEvent(
    new CustomEvent(
      "olfactus:explorer-searches-updated",
    ),
  );
}
