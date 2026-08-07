import type {
  SyncResult,
  UserDataSnapshot,
} from "@/lib/sync/types";

const syncedKeys = [
  "olfactus.collection.v1",
  "olfactus:imported-catalog:v1",
  "olfactus.simulator.scenarios.v1",
  "olfactus.timeline.ledger.v1",
  "olfactus.search.recent-queries.v1",
  "olfactus.search.recent-entities.v1",
  "olfactus.assistant.feedback.v1",
  "olfactus.graph.selected-node.v1",
  "olfactus.graph.comparison-node.v1",
  "olfactus.recovery.ledger.v1",
];

const revisionKey =
  "olfactus.sync.revision.v1";
const deviceKey =
  "olfactus.sync.device-id.v1";
const lastSyncedKey =
  "olfactus.sync.last-synced.v1";

export function getDeviceId() {
  let value =
    window.localStorage.getItem(
      deviceKey,
    );

  if (!value) {
    value =
      crypto.randomUUID();
    window.localStorage.setItem(
      deviceKey,
      value,
    );
  }

  return value;
}

export function createLocalSnapshot(): UserDataSnapshot {
  const data:
    Record<string, string> =
    {};

  for (const key of syncedKeys) {
    const value =
      window.localStorage.getItem(
        key,
      );
    if (value !== null) {
      data[key] = value;
    }
  }

  return {
    schemaVersion: 1,
    revision: Number(
      window.localStorage.getItem(
        revisionKey,
      ) ?? 0,
    ),
    updatedAt:
      new Date().toISOString(),
    deviceId:
      getDeviceId(),
    data,
  };
}

export function applyServerSnapshot(
  snapshot:
    UserDataSnapshot,
) {
  for (const key of syncedKeys) {
    const value =
      snapshot.data[key];

    if (
      typeof value ===
      "string"
    ) {
      window.localStorage.setItem(
        key,
        value,
      );
    } else {
      window.localStorage.removeItem(
        key,
      );
    }
  }

  window.localStorage.setItem(
    revisionKey,
    String(snapshot.revision),
  );
  window.localStorage.setItem(
    lastSyncedKey,
    snapshot.updatedAt,
  );
  window.dispatchEvent(
    new Event(
      "olfactus:active-catalog-refresh",
    ),
  );
  window.dispatchEvent(
    new Event(
      "olfactus:timeline-updated",
    ),
  );
}

export async function fetchServerSnapshot() {
  const response =
    await fetch(
      "/api/sync",
      {
        cache: "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      "Unable to read cloud snapshot.",
    );
  }

  return (await response.json()) as {
    snapshot:
      | UserDataSnapshot
      | null;
  };
}

export async function pushLocalSnapshot({
  force = false,
}: {
  force?: boolean;
} = {}) {
  const snapshot =
    createLocalSnapshot();
  const response =
    await fetch(
      "/api/sync",
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          snapshot,
          baseRevision:
            snapshot.revision,
          force,
        }),
      },
    );

  const result =
    (await response.json()) as
      SyncResult & {
        error?: string;
      };

  if (
    response.status === 409
  ) {
    return result;
  }

  if (!response.ok) {
    throw new Error(
      result.error ??
        "Unable to synchronize data.",
    );
  }

  applyServerSnapshot(
    result.serverSnapshot,
  );
  return result;
}

export function getLastSyncedAt() {
  return window.localStorage.getItem(
    lastSyncedKey,
  );
}
