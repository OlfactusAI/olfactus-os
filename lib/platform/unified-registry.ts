import type {
  CanonicalCollectorState,
} from "@/lib/collector-state/types";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  createGlobalIntelligenceService,
  type GlobalIntelligenceService,
} from "@/lib/graph/global-intelligence-service";
import type {
  PersonalIntelligenceGraph,
} from "@/lib/personal-graph/types";
import {
  createPlatformEventBus,
  type OlfactusEventBus,
} from "@/lib/platform/event-bus";

export interface UnifiedRegistryCatalog {
  records: FragranceRecord[];
  byId: ReadonlyMap<string, FragranceRecord>;
  ids: ReadonlySet<string>;
}

export interface UnifiedRegistryCollector {
  state: CanonicalCollectorState;
  ownedIds: ReadonlySet<string>;
  collectionByFragranceId: ReadonlyMap<
    string,
    CanonicalCollectorState["collection"][number]
  >;
}

export interface UnifiedRegistryGraph {
  personal: PersonalIntelligenceGraph;
  personalNodeById: ReadonlyMap<
    string,
    PersonalIntelligenceGraph["nodes"][number]
  >;
  global: GlobalIntelligenceService;
}

export interface OlfactusUnifiedRegistry {
  registryVersion: "UNIFIED-REGISTRY-1.1.0";
  catalog: UnifiedRegistryCatalog;
  collector: UnifiedRegistryCollector;
  graph: UnifiedRegistryGraph;
  events: OlfactusEventBus;

  resolveFragrance(
    fragranceId: string,
  ): FragranceRecord | undefined;

  resolveCollectionItem(
    fragranceId: string,
  ):
    | CanonicalCollectorState["collection"][number]
    | undefined;

  isOwned(
    fragranceId: string,
  ): boolean;
}

export function createUnifiedRegistry({
  state,
  graph,
  catalog,
  eventBus: providedEventBus,
}: {
  state: CanonicalCollectorState;
  graph: PersonalIntelligenceGraph;
  catalog: FragranceRecord[];
  eventBus?: OlfactusEventBus;
}): OlfactusUnifiedRegistry {
  const eventBus =
    providedEventBus ??
    createPlatformEventBus();

  const catalogById = new Map<
    string,
    FragranceRecord
  >();

  for (const fragrance of catalog) {
    catalogById.set(
      fragrance.id,
      fragrance,
    );
  }

  const catalogRecords = [
    ...catalogById.values(),
  ];

  const ownedIds = new Set(
    state.ownership.map(
      (item) =>
        item.fragranceId,
    ),
  );

  const collectionByFragranceId =
    new Map(
      state.collection.map(
        (item) => [
          item.fragranceId,
          item,
        ],
      ),
    );

  const personalNodeById =
    new Map(
      graph.nodes.map(
        (node) => [
          node.id,
          node,
        ],
      ),
    );

  const global =
    createGlobalIntelligenceService(
      catalogRecords,
    );

  eventBus.publish(
    "platform.registry.refreshed",
    {
      registryVersion:
        "UNIFIED-REGISTRY-1.1.0",
      catalogCount:
        catalogRecords.length,
      ownedCount:
        ownedIds.size,
      personalGraphNodes:
        graph.nodes.length,
      globalGraphEntities:
        global.graph.entities.length,
    },
    {
      source:
        "unified-registry",
    },
  );

  return {
    registryVersion:
      "UNIFIED-REGISTRY-1.1.0",

    catalog: {
      records:
        catalogRecords,
      byId:
        catalogById,
      ids:
        new Set(
          catalogById.keys(),
        ),
    },

    collector: {
      state,
      ownedIds,
      collectionByFragranceId,
    },

    graph: {
      personal:
        graph,
      personalNodeById,
      global,
    },

    events:
      eventBus,

    resolveFragrance(
      fragranceId: string,
    ) {
      return catalogById.get(
        fragranceId,
      );
    },

    resolveCollectionItem(
      fragranceId: string,
    ) {
      return collectionByFragranceId.get(
        fragranceId,
      );
    },

    isOwned(
      fragranceId: string,
    ) {
      return ownedIds.has(
        fragranceId,
      );
    },
  };
}
