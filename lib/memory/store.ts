import type {
  MemoryEvent,
  MemoryLedger,
} from "@/lib/memory/types";

const storageKey =
  "olfactus.memory.ledger.v1";
const updateEvent =
  "olfactus:memory-ledger-updated";
const maxEvents =
  10_000;

export function emptyMemoryLedger():
  MemoryLedger {
  return {
    version: 1,
    events: [],
  };
}

export function readMemoryLedger():
  MemoryLedger {
  if (
    typeof window ===
    "undefined"
  ) {
    return emptyMemoryLedger();
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey,
      );

    if (!raw) {
      return emptyMemoryLedger();
    }

    const parsed =
      JSON.parse(
        raw,
      ) as Partial<MemoryLedger>;

    return {
      version: 1,
      events:
        Array.isArray(
          parsed.events,
        )
          ? parsed.events.filter(
              isMemoryEvent,
            )
          : [],
    };
  } catch {
    return emptyMemoryLedger();
  }
}

export function writeMemoryLedger(
  ledger:
    MemoryLedger,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const normalized:
    MemoryLedger = {
    version: 1,
    events:
      ledger.events
        .slice(
          -maxEvents,
        ),
  };

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(
      normalized,
    ),
  );
  window.dispatchEvent(
    new Event(
      updateEvent,
    ),
  );
}

export function appendMemoryEvent(
  input:
    Omit<
      MemoryEvent,
      "id" |
      "timestamp" |
      "schemaVersion"
    > & {
      id?: string;
      timestamp?: string;
    },
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return undefined;
  }

  const event:
    MemoryEvent = {
    ...input,
    id:
      input.id ??
      createMemoryEventId(
        input.type,
      ),
    timestamp:
      input.timestamp ??
      new Date().toISOString(),
    confidence:
      clamp(
        input.confidence,
      ),
    schemaVersion: 1,
  };

  const ledger =
    readMemoryLedger();

  if (
    ledger.events.some(
      (item) =>
        item.id ===
        event.id,
    )
  ) {
    return event;
  }

  writeMemoryLedger({
    version: 1,
    events: [
      ...ledger.events,
      event,
    ],
  });

  return event;
}

export function removeMemoryEvent(
  eventId: string,
) {
  const ledger =
    readMemoryLedger();

  writeMemoryLedger({
    version: 1,
    events:
      ledger.events.filter(
        (event) =>
          event.id !==
          eventId,
      ),
  });
}

export function clearMemoryLedger() {
  writeMemoryLedger(
    emptyMemoryLedger(),
  );
}

export function subscribeMemoryLedger(
  listener: () =>
    void,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return () => {};
  }

  window.addEventListener(
    updateEvent,
    listener,
  );
  window.addEventListener(
    "storage",
    listener,
  );

  return () => {
    window.removeEventListener(
      updateEvent,
      listener,
    );
    window.removeEventListener(
      "storage",
      listener,
    );
  };
}

export function exportMemoryLedger() {
  return JSON.stringify(
    readMemoryLedger(),
    null,
    2,
  );
}

export function importMemoryLedger(
  raw: string,
) {
  const parsed =
    JSON.parse(
      raw,
    ) as Partial<MemoryLedger>;

  const ledger:
    MemoryLedger = {
    version: 1,
    events:
      Array.isArray(
        parsed.events,
      )
        ? parsed.events.filter(
            isMemoryEvent,
          )
        : [],
  };

  writeMemoryLedger(
    ledger,
  );

  return ledger;
}

function isMemoryEvent(
  value: unknown,
): value is MemoryEvent {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<MemoryEvent>;

  return (
    typeof candidate.id ===
      "string" &&
    typeof candidate.timestamp ===
      "string" &&
    typeof candidate.type ===
      "string" &&
    typeof candidate.source ===
      "string" &&
    typeof candidate.confidence ===
      "number" &&
    candidate.schemaVersion ===
      1
  );
}

function createMemoryEventId(
  type: string,
) {
  const suffix =
    typeof crypto !==
      "undefined" &&
    "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)}`;

  return (
    `memory:${type}:${suffix}`
  );
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}
