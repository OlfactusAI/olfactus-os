"use client";

import {
  createContext,
  useContext,
  useMemo,
} from "react";

import {
  useActiveFragranceCatalog,
} from "@/components/providers/active-catalog-provider";
import {
  useCollection,
} from "@/components/providers/collection-provider";
import {
  useMemoryEngine,
} from "@/components/providers/memory-provider";
import {
  usePredictiveIntelligence,
} from "@/components/providers/predictive-provider";
import {
  demoProfile,
} from "@/lib/data/demo";
import {
  deriveCanonicalCollectorState,
} from "@/lib/collector-state/derive";
import type {
  CanonicalCollectorState,
} from "@/lib/collector-state/types";
import {
  buildPersonalIntelligenceGraph,
} from "@/lib/personal-graph/build";
import type {
  PersonalIntelligenceGraph,
} from "@/lib/personal-graph/types";
import {
  createIntelligenceApi,
  type OlfactusIntelligenceApi,
} from "@/lib/intelligence-api";
import {
  createUnifiedRegistry,
  type OlfactusUnifiedRegistry,
} from "@/lib/platform/unified-registry";
import {
  createPlatformEventBus,
  type OlfactusEventBus,
} from "@/lib/platform/event-bus";

interface CollectorIntelligenceContextValue {
  hydrated: boolean;
  state: CanonicalCollectorState;
  graph: PersonalIntelligenceGraph;
  registry: OlfactusUnifiedRegistry;
  eventBus: OlfactusEventBus;
  api: OlfactusIntelligenceApi;
}

const CollectorIntelligenceContext =
  createContext<CollectorIntelligenceContextValue | null>(
    null,
  );

export function CollectorIntelligenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { catalog } = useActiveFragranceCatalog();
  const {
    items,
    hydrated: collectionHydrated,
  } = useCollection();
  const {
    events,
    summary,
    insights,
    collectorDna,
    hydrated: memoryHydrated,
  } = useMemoryEngine();
  const {
    snapshot,
    collectionForecast,
    hydrated: predictiveHydrated,
  } = usePredictiveIntelligence();

  const state = useMemo(
    () =>
      deriveCanonicalCollectorState({
        profile: demoProfile,
        collection: items,
        events,
        memorySummary: summary,
        memoryInsights: insights,
        collectorDna,
        predictiveSnapshot: snapshot,
        collectionForecast,
      }),
    [
      items,
      events,
      summary,
      insights,
      collectorDna,
      snapshot,
      collectionForecast,
    ],
  );

  const eventBus = useMemo(
    () =>
      createPlatformEventBus(),
    [],
  );

  const graph = useMemo(
    () =>
      buildPersonalIntelligenceGraph({
        state,
        catalog,
        events,
      }),
    [state, catalog, events],
  );

  const registry = useMemo(
    () =>
      createUnifiedRegistry({
        state,
        graph,
        catalog,
        eventBus,
      }),
    [state, graph, catalog, eventBus],
  );

  const api = useMemo(
    () =>
      createIntelligenceApi({
        state,
        graph,
        catalog,
        registry,
      }),
    [state, graph, catalog, registry],
  );

  const value = useMemo(
    () => ({
      hydrated:
        collectionHydrated &&
        memoryHydrated &&
        predictiveHydrated,
      state,
      graph,
      registry,
      eventBus,
      api,
    }),
    [
      collectionHydrated,
      memoryHydrated,
      predictiveHydrated,
      state,
      graph,
      registry,
      eventBus,
      api,
    ],
  );

  return (
    <CollectorIntelligenceContext.Provider value={value}>
      {children}
    </CollectorIntelligenceContext.Provider>
  );
}

export function useCollectorIntelligence() {
  const context = useContext(CollectorIntelligenceContext);

  if (!context) {
    throw new Error(
      "useCollectorIntelligence must be used within CollectorIntelligenceProvider",
    );
  }

  return context;
}
