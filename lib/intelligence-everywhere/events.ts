import type {
  IntelligenceEvent,
} from "@/lib/intelligence-everywhere/types";

const storageKey =
  "olfactus.intelligence.events.v1";

export function readIntelligenceEvents(): IntelligenceEvent[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [] as IntelligenceEvent[];
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey,
      );
    return raw
      ? (JSON.parse(
          raw,
        ) as IntelligenceEvent[])
      : [];
  } catch {
    return [];
  }
}

export function writeIntelligenceEvents(
  events:
    IntelligenceEvent[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(
      events.slice(0, 500),
    ),
  );
  window.dispatchEvent(
    new Event(
      "olfactus:intelligence-events-updated",
    ),
  );
}

export function appendIntelligenceEvent(
  event:
    IntelligenceEvent,
) {
  const current =
    readIntelligenceEvents();

  if (
    current.some(
      (
        item:
          IntelligenceEvent,
      ) =>
        item.id ===
        event.id,
    )
  ) {
    return current;
  }

  const next = [
    event,
    ...current,
  ];
  writeIntelligenceEvents(
    next,
  );
  return next;
}

export function generateCollectionHealthEvent({
  previousScore,
  nextScore,
}: {
  previousScore: number;
  nextScore: number;
}) {
  if (
    previousScore ===
    nextScore
  ) {
    return null;
  }

  const delta =
    nextScore -
    previousScore;

  return {
    id:
      `collection-health:${nextScore}:${new Date().toISOString().slice(0, 10)}`,
    type:
      "collection-health-change",
    title:
      delta > 0
        ? "Collection Health Increased"
        : "Collection Health Declined",
    summary:
      `Collection Health changed ${delta > 0 ? "+" : ""}${delta} points.`,
    createdAt:
      new Date().toISOString(),
    severity:
      delta > 0
        ? "positive"
        : "warning",
    metadata: {
      previousScore,
      nextScore,
      delta,
    },
  } satisfies IntelligenceEvent;
}
