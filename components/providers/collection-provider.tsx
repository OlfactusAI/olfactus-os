"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import type { CollectionItem } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import { collectionReducer } from "@/lib/collection/store";

const STORAGE_KEY = "olfactus.collection.v1";

interface CollectionContextValue {
  items: CollectionItem[];
  owned: Array<{ item: CollectionItem; fragrance: FragranceRecord }>;
  available: FragranceRecord[];
  analysis: ReturnType<typeof analyzeCollectionHealth>;
  hydrated: boolean;
  addFragrance: (fragranceId: string) => void;
  removeFragrance: (fragranceId: string) => void;
  logWear: (fragranceId: string) => void;
  toggleFavorite: (fragranceId: string) => void;
  updateItem: (fragranceId: string, patch: Partial<Omit<CollectionItem, "fragranceId">>) => void;
  resetCollection: () => void;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(collectionReducer, { items: demoCollection });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "hydrate", items: JSON.parse(saved) as CollectionItem[] });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [hydrated, state.items]);

  const owned = useMemo(
    () =>
      state.items
        .map((item) => ({ item, fragrance: fragrances.find((fragrance) => fragrance.id === item.fragranceId) }))
        .filter((entry): entry is { item: CollectionItem; fragrance: FragranceRecord } => Boolean(entry.fragrance)),
    [state.items],
  );
  const ownedIds = useMemo(() => new Set(state.items.map((item) => item.fragranceId)), [state.items]);
  const available = useMemo(() => fragrances.filter((fragrance) => !ownedIds.has(fragrance.id)), [ownedIds]);
  const analysis = useMemo(
    () => analyzeCollectionHealth({ collection: state.items, profile: demoProfile, catalog: fragrances }),
    [state.items],
  );

  const value = useMemo<CollectionContextValue>(
    () => ({
      items: state.items,
      owned,
      available,
      analysis,
      hydrated,
      addFragrance: (fragranceId) => dispatch({ type: "add", fragranceId }),
      removeFragrance: (fragranceId) => dispatch({ type: "remove", fragranceId }),
      logWear: (fragranceId) => dispatch({ type: "log-wear", fragranceId }),
      toggleFavorite: (fragranceId) => dispatch({ type: "toggle-favorite", fragranceId }),
      updateItem: (fragranceId, patch) => dispatch({ type: "update", fragranceId, patch }),
      resetCollection: () => dispatch({ type: "reset", items: demoCollection }),
    }),
    [analysis, available, hydrated, owned, state.items],
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (!context) throw new Error("useCollection must be used within CollectionProvider");
  return context;
}
