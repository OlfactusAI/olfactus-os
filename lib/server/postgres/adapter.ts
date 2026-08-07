import "server-only";

import type {
  BackupRecord,
  DeviceRecord,
  SyncOperation,
  SyncRecord,
} from "@/lib/server/postgres/types";

export interface ProductionDataAdapter {
  health(): Promise<{
    ok: boolean;
    migrationVersion:
      string | null;
    latencyMs: number;
  }>;
  listRecords(
    accountId: string,
    sinceRevision?: number,
  ): Promise<SyncRecord[]>;
  applyOperations(
    accountId: string,
    operations:
      SyncOperation[],
  ): Promise<{
    accepted:
      SyncRecord[];
    conflicts:
      Array<{
        operation:
          SyncOperation;
        serverRecord:
          SyncRecord;
      }>;
  }>;
  listDevices(
    accountId: string,
  ): Promise<DeviceRecord[]>;
  upsertDevice(
    device:
      DeviceRecord,
  ): Promise<DeviceRecord>;
  revokeDevice(
    accountId: string,
    deviceId: string,
  ): Promise<boolean>;
  createBackup(
    backup:
      BackupRecord,
  ): Promise<BackupRecord>;
  listBackups(
    accountId: string,
  ): Promise<BackupRecord[]>;
}
