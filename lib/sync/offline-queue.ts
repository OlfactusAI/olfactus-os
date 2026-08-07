import type {
  SyncOperation,
} from "@/lib/server/postgres/types";

const storageKey =
  "olfactus.sync.offline-queue.v1";

export function loadOfflineQueue() {
  if (
    typeof window ===
    "undefined"
  ) {
    return [] as SyncOperation[];
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey,
      );
    return raw
      ? JSON.parse(raw)
      : [];
  } catch {
    return [];
  }
}

export function enqueueSyncOperation(
  operation:
    SyncOperation,
) {
  const next = [
    ...loadOfflineQueue(),
    operation,
  ].slice(-500);
  write(next);
  return next;
}

export function removeQueuedOperations(
  operationIds:
    string[],
) {
  const ids =
    new Set(
      operationIds,
    );
  const next =
    loadOfflineQueue().filter(
      (
        operation:
          SyncOperation,
      ) =>
        !ids.has(
          operation.id,
        ),
    );
  write(next);
  return next;
}

export function clearOfflineQueue() {
  write([]);
}

function write(
  operations:
    SyncOperation[],
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
      operations,
    ),
  );
  window.dispatchEvent(
    new Event(
      "olfactus:sync-queue-updated",
    ),
  );
}
