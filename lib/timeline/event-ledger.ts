import type {
  TimelineEvent,
  TimelineLedger,
} from "@/lib/timeline/types";

export const TIMELINE_STORAGE_KEY =
  "olfactus.timeline.ledger.v1";

export function createEmptyLedger(): TimelineLedger {
  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    events: [],
  };
}

export function readTimelineLedger(): TimelineLedger {
  if (typeof window === "undefined") {
    return createEmptyLedger();
  }

  try {
    const raw = window.localStorage.getItem(
      TIMELINE_STORAGE_KEY,
    );
    if (!raw) return createEmptyLedger();

    const parsed = JSON.parse(raw) as TimelineLedger;
    if (
      parsed.schemaVersion !== 1 ||
      !Array.isArray(parsed.events)
    ) {
      return createEmptyLedger();
    }

    return parsed;
  } catch {
    return createEmptyLedger();
  }
}

export function writeTimelineLedger(
  ledger: TimelineLedger,
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    TIMELINE_STORAGE_KEY,
    JSON.stringify({
      ...ledger,
      events: deduplicateEvents(ledger.events)
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() -
            new Date(b.timestamp).getTime(),
        )
        .slice(-1500),
    }),
  );
}

export function appendTimelineEvent(
  event: Omit<TimelineEvent, "id" | "timestamp"> & {
    id?: string;
    timestamp?: string;
  },
) {
  const ledger = readTimelineLedger();
  const complete: TimelineEvent = {
    ...event,
    id:
      event.id ??
      `${event.type}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    timestamp:
      event.timestamp ?? new Date().toISOString(),
  };

  ledger.events.push(complete);
  writeTimelineLedger(ledger);
  window.dispatchEvent(
    new CustomEvent("olfactus:timeline-updated"),
  );

  return complete;
}

export function clearTimelineLedger() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(
    TIMELINE_STORAGE_KEY,
  );
  window.dispatchEvent(
    new CustomEvent("olfactus:timeline-updated"),
  );
}

function deduplicateEvents(
  events: TimelineEvent[],
) {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

export function updateTimelineEvent(
  eventId: string,
  patch: Partial<
    Omit<
      TimelineEvent,
      "id"
    >
  >,
) {
  const ledger =
    readTimelineLedger();
  const index =
    ledger.events.findIndex(
      (event) =>
        event.id ===
        eventId,
    );

  if (index < 0) {
    return null;
  }

  ledger.events[index] = {
    ...ledger.events[index],
    ...patch,
    id: eventId,
  };
  writeTimelineLedger(ledger);
  window.dispatchEvent(
    new CustomEvent(
      "olfactus:timeline-updated",
    ),
  );

  return ledger.events[index];
}

export function deleteTimelineEvent(
  eventId: string,
) {
  const ledger =
    readTimelineLedger();
  const before =
    ledger.events.length;
  ledger.events =
    ledger.events.filter(
      (event) =>
        event.id !==
        eventId,
    );

  if (
    ledger.events.length ===
    before
  ) {
    return false;
  }

  writeTimelineLedger(ledger);
  window.dispatchEvent(
    new CustomEvent(
      "olfactus:timeline-updated",
    ),
  );
  return true;
}
