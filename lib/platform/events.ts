export interface PlatformEventPayloads {
  "platform.context.created": {
    contextId: string;
    contextVersion: string;
    registryVersion: string;
    collectorStateVersion: string;
    catalogCount: number;
  };

  "platform.context.invalidated": {
    contextId: string;
    reason: string;
  };

  "platform.registry.refreshed": {
    registryVersion: string;
    catalogCount: number;
    ownedCount: number;
    personalGraphNodes: number;
    globalGraphEntities: number;
  };

  "collector.collection.changed": {
    collectionSize: number;
    fragranceId?: string;
    action?: "added" | "removed" | "updated";
  };

  "collector.wear.logged": {
    fragranceId: string;
    wearCount?: number;
  };

  "collector.preference.changed": {
    dimension?: string;
    previousValue?: number;
    nextValue?: number;
  };

  "catalog.record.staged": {
    stagingId: string;
    canonicalId: string;
    sourceId: string;
  };

  "catalog.record.activation-evaluated": {
    stagingId: string;
    canonicalId: string;
    allowed: boolean;
    confidence: number;
    reasons: string[];
  };

  "catalog.record.activated": {
    canonicalId: string;
    activationLevel?: string;
  };

  "catalog.batch.completed": {
    batchId: string;
    sourceId: string;
    incoming: number;
    accepted: number;
    rejected: number;
    duplicateCandidates: number;
    activationReady: number;
  };

  "catalog.batch.rolled-back": {
    batchId: string;
    rolledBack: number;
  };

  "recommendation.generated": {
    fragranceId?: string;
    score?: number;
    confidence?: number;
  };

  "recommendation.accepted": {
    fragranceId: string;
  };

  "recommendation.rejected": {
    fragranceId: string;
  };

  "prediction.updated": {
    scope: string;
    confidence?: number;
  };

  "decision.completed": {
    decisionId?: string;
    fragranceId?: string;
    verdict?: string;
  };

  "graph.updated": {
    scope: "personal" | "global";
    nodeCount?: number;
    edgeCount?: number;
  };

  "simulation.completed": {
    simulationId?: string;
    horizon?: string;
  };
}

export type PlatformEventType =
  keyof PlatformEventPayloads;

export interface PlatformPublishOptions {
  source?: string;
  correlationId?: string;
  causationId?: string;
}

export type PlatformEvent<
  TType extends PlatformEventType = PlatformEventType,
> = {
  [K in TType]: {
    id: string;
    type: K;
    occurredAt: string;
    source: string;
    payload: PlatformEventPayloads[K];
    correlationId?: string;
    causationId?: string;
  };
}[TType];

export type PlatformEventHandler<
  TType extends PlatformEventType,
> = (
  event: PlatformEvent<TType>,
) => void;

export type PlatformAnyEventHandler = (
  event: PlatformEvent,
) => void;
