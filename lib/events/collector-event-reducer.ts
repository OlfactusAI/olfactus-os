import type {
  MemoryEvent,
  MemoryEventType,
} from "@/lib/memory/types";

export interface CollectorEventDerivedState {
  totalEvents: number;
  firstEventAt?: string;
  latestEventAt?: string;
  eventTypeCounts: Partial<Record<MemoryEventType, number>>;
  wearCountByFragrance: Record<string, number>;
  viewCountByFragrance: Record<string, number>;
  comparisonCountByFragrance: Record<string, number>;
  simulationCount: number;
  recommendationsShown: number;
  recommendationsAccepted: number;
  recommendationsIgnored: number;
  recommendationOutcomeRate?: number;
  workspacesVisited: Record<string, number>;
  correctedMemoryCount: number;
}

export function replayCollectorEvents(
  events: MemoryEvent[],
): CollectorEventDerivedState {
  const ordered = [...events].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  );

  const state: CollectorEventDerivedState = {
    totalEvents: 0,
    eventTypeCounts: {},
    wearCountByFragrance: {},
    viewCountByFragrance: {},
    comparisonCountByFragrance: {},
    simulationCount: 0,
    recommendationsShown: 0,
    recommendationsAccepted: 0,
    recommendationsIgnored: 0,
    workspacesVisited: {},
    correctedMemoryCount: 0,
  };

  for (const event of ordered) {
    state.totalEvents += 1;
    state.eventTypeCounts[event.type] =
      (state.eventTypeCounts[event.type] ?? 0) + 1;

    const fragranceId =
      event.entity?.type === "fragrance"
        ? event.entity.id
        : undefined;

    switch (event.type) {
      case "wear-recorded":
        increment(state.wearCountByFragrance, fragranceId);
        break;
      case "fragrance-viewed":
        increment(state.viewCountByFragrance, fragranceId);
        break;
      case "comparison-executed":
        increment(state.comparisonCountByFragrance, fragranceId);
        break;
      case "simulation-created":
      case "simulation-applied":
        state.simulationCount += 1;
        break;
      case "recommendation-shown":
        state.recommendationsShown += 1;
        break;
      case "recommendation-accepted":
        state.recommendationsAccepted += 1;
        break;
      case "recommendation-ignored":
        state.recommendationsIgnored += 1;
        break;
      case "navigation": {
        const workspace =
          event.entity?.type === "workspace"
            ? event.entity.id
            : typeof event.metadata.pathname === "string"
              ? event.metadata.pathname
              : undefined;
        increment(state.workspacesVisited, workspace);
        break;
      }
      case "memory-corrected":
        state.correctedMemoryCount += 1;
        break;
      default:
        break;
    }
  }

  state.firstEventAt = ordered[0]?.timestamp;
  state.latestEventAt = ordered.at(-1)?.timestamp;

  const outcomes =
    state.recommendationsAccepted +
    state.recommendationsIgnored;

  state.recommendationOutcomeRate = outcomes
    ? Math.round(
        (state.recommendationsAccepted / outcomes) * 100,
      )
    : undefined;

  return state;
}

function increment(
  target: Record<string, number>,
  key?: string,
) {
  if (!key) return;
  target[key] = (target[key] ?? 0) + 1;
}
