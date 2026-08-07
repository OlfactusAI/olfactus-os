import type {
  CollectionItem,
  CollectorProfile,
} from "@/lib/domain/collection";
import type {
  CollectorDnaTrait,
  MemoryEvent,
  MemoryInsight,
  MemoryQuerySummary,
} from "@/lib/memory/types";
import type {
  PredictiveSnapshot,
} from "@/lib/predictive/types";
import type {
  CollectionForecast,
} from "@/lib/prediction/prediction-types";
import {
  replayCollectorEvents,
} from "@/lib/events/collector-event-reducer";
import {
  createScoreProvenance,
} from "@/lib/intelligence-api/provenance";
import type {
  CanonicalCollectorState,
} from "@/lib/collector-state/types";

export function deriveCanonicalCollectorState({
  profile,
  collection,
  events,
  memorySummary,
  memoryInsights,
  collectorDna,
  predictiveSnapshot,
  collectionForecast,
}: {
  profile: CollectorProfile;
  collection: CollectionItem[];
  events: MemoryEvent[];
  memorySummary: MemoryQuerySummary;
  memoryInsights: MemoryInsight[];
  collectorDna: CollectorDnaTrait[];
  predictiveSnapshot: PredictiveSnapshot;
  collectionForecast: CollectionForecast;
}): CanonicalCollectorState {
  const eventState = replayCollectorEvents(events);

  const ownership = collection
    .map((item) => ({
      fragranceId: item.fragranceId,
      wearCount: item.wearCount,
      memoryWearCount:
        eventState.wearCountByFragrance[item.fragranceId] ?? 0,
      daysSinceLastWear: item.daysSinceLastWear,
      personalRating: item.personalRating,
      favorite: Boolean(item.favorite),
      purchasePrice: item.purchasePrice,
      fillLevelPercent: item.fillLevelPercent,
    }))
    .sort((a, b) => b.wearCount - a.wearCount);

  const totalWears = ownership.reduce(
    (sum, item) => sum + item.wearCount,
    0,
  );
  const topWear = ownership[0]?.wearCount ?? 0;
  const concentration = totalWears ? topWear / totalWears : 0;

  const rotationStyle =
    ownership.length === 0
      ? "unknown"
      : concentration >= 0.45
        ? "concentrated"
        : concentration <= 0.18
          ? "wide"
          : "balanced";

  const additions =
    eventState.eventTypeCounts["collection-added"] ?? 0;
  const purchases =
    eventState.eventTypeCounts["purchase-recorded"] ?? 0;
  const acquisitionSignals = additions + purchases;

  const purchaseVelocitySignal =
    acquisitionSignals === 0
      ? "unknown"
      : acquisitionSignals <= 2
        ? "slow"
        : acquisitionSignals <= 6
          ? "moderate"
          : "fast";

  const directEvidence = Math.min(35, collection.length * 2.5);
  const memoryEvidence = Math.min(
    35,
    eventState.totalEvents * 0.7,
  );
  const predictionEvidence = Math.min(
    30,
    predictiveSnapshot.evidenceEvents * 2,
  );

  const overallConfidence = Math.max(
    35,
    Math.min(
      98,
      Math.round(
        directEvidence +
          memoryEvidence +
          predictionEvidence,
      ),
    ),
  );

  const generatedAt = new Date().toISOString();

  return {
    schemaVersion: 1,
    stateVersion: "COLLECTOR-STATE-1.0.0",
    generatedAt,
    profile,
    collection,
    ownership,
    preferences: {
      families: predictiveSnapshot.familyAffinities,
      accords: predictiveSnapshot.accordAffinities,
      collectorDna,
    },
    behavior: {
      eventState,
      purchaseVelocitySignal,
      rotationStyle,
      recommendationAcceptanceRate:
        eventState.recommendationOutcomeRate,
    },
    prediction: {
      snapshot: predictiveSnapshot,
      collectionForecast,
    },
    memory: {
      summary: memorySummary,
      insights: memoryInsights,
    },
    confidence: {
      overall: overallConfidence,
      provenance: createScoreProvenance({
        score: overallConfidence,
        confidence: overallConfidence,
        modelId: "COLLECTOR-STATE",
        generatedAt,
        evidence: [
          {
            id: "collection-state",
            label: "Current collection",
            kind: "direct-user",
            contribution: directEvidence,
            detail: `${collection.length} active collection records contribute direct collector-state evidence.`,
          },
          {
            id: "memory-events",
            label: "Behavioral memory",
            kind: "observed-behavior",
            contribution: memoryEvidence,
            detail: `${eventState.totalEvents} structured memory events are available.`,
          },
          {
            id: "predictive-events",
            label: "Predictive evidence",
            kind: "calculated",
            contribution: predictionEvidence,
            detail: `${predictiveSnapshot.evidenceEvents} events currently contribute to predictive intelligence.`,
          },
        ],
        limitations: [
          ...(eventState.totalEvents < 10
            ? ["Collector memory is still sparse."]
            : []),
          ...(predictiveSnapshot.evidenceEvents < 5
            ? ["Predictive behavior evidence is still limited."]
            : []),
        ],
      }),
    },
  };
}
