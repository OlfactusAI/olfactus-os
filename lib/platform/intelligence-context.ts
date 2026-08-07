import type {
  CanonicalCollectorState,
} from "@/lib/collector-state/types";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  GlobalIntelligenceGraph,
} from "@/lib/graph/global-types";
import {
  listActiveIntelligenceModels,
} from "@/lib/models/registry";
import type {
  PersonalIntelligenceGraph,
} from "@/lib/personal-graph/types";
import type {
  OlfactusUnifiedRegistry,
} from "@/lib/platform/unified-registry";

export interface UnifiedIntelligenceContext {
  contextVersion: "UIC-1.0.0";
  contextId: string;
  createdAt: string;
  registryVersion:
    OlfactusUnifiedRegistry["registryVersion"];
  collector:
    CanonicalCollectorState;
  collection:
    CanonicalCollectorState["collection"];
  catalog:
    FragranceRecord[];
  ownership:
    CanonicalCollectorState["ownership"];
  preferences:
    CanonicalCollectorState["preferences"];
  memory:
    CanonicalCollectorState["memory"];
  prediction:
    CanonicalCollectorState["prediction"];
  personalGraph:
    PersonalIntelligenceGraph;
  globalGraph:
    GlobalIntelligenceGraph;
  models:
    ReturnType<
      typeof listActiveIntelligenceModels
    >;
  confidence:
    CanonicalCollectorState["confidence"];
}

export function createUnifiedIntelligenceContext({
  registry,
}: {
  registry:
    OlfactusUnifiedRegistry;
}): UnifiedIntelligenceContext {
  const collector =
    registry.collector.state;
  const createdAt =
    collector.generatedAt;
  const contextId =
    buildContextId({
      registry,
      createdAt,
    });

  const context = {
    contextVersion:
      "UIC-1.0.0" as const,
    contextId,
    createdAt,
    registryVersion:
      registry.registryVersion,
    collector,
    collection:
      collector.collection,
    catalog:
      registry.catalog.records,
    ownership:
      collector.ownership,
    preferences:
      collector.preferences,
    memory:
      collector.memory,
    prediction:
      collector.prediction,
    personalGraph:
      registry.graph.personal,
    globalGraph:
      registry.graph.global.graph,
    models:
      listActiveIntelligenceModels(),
    confidence:
      collector.confidence,
  } satisfies UnifiedIntelligenceContext;

  registry.events.publish(
    "platform.context.created",
    {
      contextId,
      contextVersion:
        context.contextVersion,
      registryVersion:
        registry.registryVersion,
      collectorStateVersion:
        collector.stateVersion,
      catalogCount:
        context.catalog.length,
    },
    {
      source:
        "unified-intelligence-context",
    },
  );

  return Object.freeze(
    context,
  );
}

export function invalidateUnifiedIntelligenceContext({
  registry,
  contextId,
  reason,
}: {
  registry:
    OlfactusUnifiedRegistry;
  contextId: string;
  reason: string;
}) {
  return registry.events.publish(
    "platform.context.invalidated",
    {
      contextId,
      reason,
    },
    {
      source:
        "unified-intelligence-context",
    },
  );
}

function buildContextId({
  registry,
  createdAt,
}: {
  registry:
    OlfactusUnifiedRegistry;
  createdAt: string;
}) {
  const seed = [
    registry.registryVersion,
    createdAt,
    registry.catalog.records.length,
    registry.collector.state.collection.length,
    registry.graph.personal.nodes.length,
    registry.graph.global.graph.entities.length,
  ].join("|");

  let hash = 2166136261;

  for (
    let index = 0;
    index < seed.length;
    index += 1
  ) {
    hash ^= seed.charCodeAt(
      index,
    );
    hash = Math.imul(
      hash,
      16777619,
    );
  }

  return `ctx_${(
    hash >>> 0
  ).toString(36)}`;
}
