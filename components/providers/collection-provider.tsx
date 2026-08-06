"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { demoCollection, demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import type { CollectionItem } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import { collectionReducer } from "@/lib/collection/store";
import { appendTimelineEvent, readTimelineLedger } from "@/lib/timeline/event-ledger";
import type { TimelineMetricSnapshot } from "@/lib/timeline/types";

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

  useEffect(() => {
    if (!hydrated) return;

    const totalWears = state.items.reduce(
      (sum, item) => sum + item.wearCount,
      0,
    );
    const snapshot: TimelineMetricSnapshot = {
      collectionHealth: analysis.score,
      rotation: analysis.dimensions.rotation,
      diversity: analysis.dimensions.diversity,
      seasonalBalance: analysis.dimensions.seasonalBalance,
      redundancy: analysis.dimensions.redundancy,
      totalWears,
      bottleCount: state.items.length,
    };

    const ledger = readTimelineLedger();
    if (ledger.events.length === 0) {
      appendTimelineEvent({
        id: "timeline-baseline-v1",
        type: "baseline_created",
        title: "Timeline baseline created",
        summary: "OLFACTUS captured the initial longitudinal collection state.",
        snapshot,
      });
      return;
    }

    const latestSnapshot = [...ledger.events]
      .reverse()
      .find((event) => event.snapshot)?.snapshot;

    if (
      !latestSnapshot ||
      JSON.stringify(latestSnapshot) !==
        JSON.stringify(snapshot)
    ) {
      appendTimelineEvent({
        type: "collection_health_updated",
        title: "Collection intelligence updated",
        summary: `Collection Health is now ${analysis.score}/100 with Rotation at ${analysis.dimensions.rotation}/100.`,
        snapshot,
      });
    }
  }, [analysis, hydrated, state.items]);

  const value = useMemo<CollectionContextValue>(
    () => ({
      items: state.items,
      owned,
      available,
      analysis,
      hydrated,
      addFragrance: (fragranceId) => {
        const fragrance = fragrances.find((item) => item.id === fragranceId);
        appendTimelineEvent({
          type: "bottle_added",
          title: "Bottle added",
          summary: fragrance
            ? `${fragrance.brand} ${fragrance.name} entered the collection.`
            : "A fragrance entered the collection.",
          fragranceId,
          fragranceName: fragrance?.name,
        });
        dispatch({ type: "add", fragranceId });
      },
      removeFragrance: (fragranceId) => {
        const fragrance = fragrances.find((item) => item.id === fragranceId);
        appendTimelineEvent({
          type: "bottle_removed",
          title: "Bottle removed",
          summary: fragrance
            ? `${fragrance.brand} ${fragrance.name} left the active collection.`
            : "A fragrance left the active collection.",
          fragranceId,
          fragranceName: fragrance?.name,
        });
        dispatch({ type: "remove", fragranceId });
      },
      logWear: (fragranceId) => {
        const fragrance = fragrances.find((item) => item.id === fragranceId);
        appendTimelineEvent({
          type: "wear_logged",
          title: "Wear logged",
          summary: fragrance
            ? `${fragrance.name} was worn and added to the rotation history.`
            : "A wear was added to the rotation history.",
          fragranceId,
          fragranceName: fragrance?.name,
        });
        dispatch({ type: "log-wear", fragranceId });
      },
      toggleFavorite: (fragranceId) => {
        const fragrance = fragrances.find((item) => item.id === fragranceId);
        appendTimelineEvent({
          type: "favorite_changed",
          title: "Favorite status changed",
          summary: fragrance
            ? `${fragrance.name} received an updated favorite status.`
            : "Favorite status changed.",
          fragranceId,
          fragranceName: fragrance?.name,
        });
        dispatch({ type: "toggle-favorite", fragranceId });
      },
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
