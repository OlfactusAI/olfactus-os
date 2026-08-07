export interface SyncRecord {
  id: string;
  accountId: string;
  entityType:
    | "collection-item"
    | "wear-event"
    | "timeline-event"
    | "scenario"
    | "imported-fragrance"
    | "assistant-feedback"
    | "preference"
    | "recovery-action";
  entityId: string;
  payload: Record<string, unknown>;
  revision: number;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DeviceRecord {
  id: string;
  accountId: string;
  name: string;
  userAgent?: string;
  createdAt: string;
  lastSeenAt: string;
  revokedAt?: string;
}

export interface BackupRecord {
  id: string;
  accountId: string;
  reason:
    | "daily"
    | "manual"
    | "before-import"
    | "before-simulation"
    | "before-migration"
    | "before-delete";
  createdAt: string;
  revision: number;
  payload: Record<string, string>;
}

export interface SyncOperation {
  id: string;
  accountId?: string;
  entityType: SyncRecord["entityType"];
  entityId: string;
  operation: "upsert" | "delete";
  baseRevision: number;
  deviceId: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface SyncConflict {
  id: string;
  entityType: SyncRecord["entityType"];
  entityId: string;
  localOperation: SyncOperation;
  serverRecord: SyncRecord;
  detectedAt: string;
}
