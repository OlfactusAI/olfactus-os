export type SyncStatus =
  | "local-only"
  | "syncing"
  | "synced"
  | "pending"
  | "conflict"
  | "error";

export interface UserDataSnapshot {
  schemaVersion: 1;
  revision: number;
  updatedAt: string;
  deviceId: string;
  data: Record<string, string>;
}

export interface SyncEnvelope {
  accountId: string;
  snapshot: UserDataSnapshot;
}

export interface SyncResult {
  status: "synced" | "conflict";
  serverSnapshot: UserDataSnapshot;
  acceptedRevision: number;
}
