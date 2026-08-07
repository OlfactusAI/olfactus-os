import type {
  SyncConflict,
} from "@/lib/server/postgres/types";

const storageKey =
  "olfactus.sync.conflicts.v1";

export function loadSyncConflicts() {
  if (
    typeof window ===
    "undefined"
  ) {
    return [] as SyncConflict[];
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

export function saveSyncConflicts(
  conflicts:
    SyncConflict[],
) {
  window.localStorage.setItem(
    storageKey,
    JSON.stringify(
      conflicts,
    ),
  );
  window.dispatchEvent(
    new Event(
      "olfactus:sync-conflicts-updated",
    ),
  );
}

export function resolveSyncConflict(
  conflictId: string,
) {
  const next =
    loadSyncConflicts().filter(
      (
        conflict:
          SyncConflict,
      ) =>
        conflict.id !==
        conflictId,
    );
  saveSyncConflicts(next);
  return next;
}
