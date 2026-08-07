import type {
  SyncConflict,
  SyncOperation,
} from "@/lib/server/postgres/types";
import {
  loadOfflineQueue,
  removeQueuedOperations,
} from "@/lib/sync/offline-queue";
import {
  saveSyncConflicts,
} from "@/lib/sync/conflicts";

export async function flushOfflineQueue() {
  const operations =
    loadOfflineQueue();

  if (!operations.length) {
    return {
      accepted: 0,
      conflicts: 0,
    };
  }

  const response =
    await fetch(
      "/api/sync/operations",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          operations,
        }),
      },
    );

  const result =
    (await response.json()) as {
      accepted?:
        string[];
      conflicts?:
        SyncConflict[];
      error?: string;
    };

  if (!response.ok) {
    throw new Error(
      result.error ??
        "Unable to synchronize queued changes.",
    );
  }

  removeQueuedOperations(
    result.accepted ?? [],
  );
  saveSyncConflicts(
    result.conflicts ?? [],
  );

  return {
    accepted:
      result.accepted?.length ??
      0,
    conflicts:
      result.conflicts?.length ??
      0,
  };
}

export function createOperation({
  entityType,
  entityId,
  operation,
  baseRevision,
  deviceId,
  payload,
}: Omit<
  SyncOperation,
  | "id"
  | "createdAt"
>) {
  return {
    id:
      crypto.randomUUID(),
    entityType,
    entityId,
    operation,
    baseRevision,
    deviceId,
    payload,
    createdAt:
      new Date().toISOString(),
  } satisfies SyncOperation;
}
