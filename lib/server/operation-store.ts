import "server-only";

import {
  randomUUID,
} from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type {
  BackupRecord,
  DeviceRecord,
  SyncOperation,
  SyncRecord,
} from "@/lib/server/postgres/types";

interface OperationDatabase {
  schemaVersion: 1;
  records:
    SyncRecord[];
  devices:
    DeviceRecord[];
  backups:
    BackupRecord[];
}

const empty:
  OperationDatabase = {
    schemaVersion: 1,
    records: [],
    devices: [],
    backups: [],
  };

function location() {
  return path.join(
    process.env
      .OLFACTUS_DATA_DIR ??
      path.join(
        process.cwd(),
        ".olfactus-data",
      ),
    "operation-database.json",
  );
}

async function read() {
  try {
    return JSON.parse(
      await readFile(
        location(),
        "utf8",
      ),
    ) as OperationDatabase;
  } catch {
    return structuredClone(
      empty,
    );
  }
}

async function write(
  database:
    OperationDatabase,
) {
  const target =
    location();
  await mkdir(
    path.dirname(target),
    {
      recursive: true,
    },
  );
  const temporary =
    `${target}.tmp`;
  await writeFile(
    temporary,
    JSON.stringify(
      database,
      null,
      2,
    ),
  );
  await rename(
    temporary,
    target,
  );
}

let queue =
  Promise.resolve();

async function mutate<T>(
  callback: (
    database:
      OperationDatabase,
  ) => T | Promise<T>,
) {
  let resolveValue:
    (value: T) => void;
  let rejectValue:
    (reason?: unknown) => void;
  const result =
    new Promise<T>(
      (resolve, reject) => {
        resolveValue =
          resolve;
        rejectValue =
          reject;
      },
    );

  queue = queue.then(
    async () => {
      try {
        const database =
          await read();
        const value =
          await callback(
            database,
          );
        await write(
          database,
        );
        resolveValue(value);
      } catch (error) {
        rejectValue(error);
      }
    },
  );

  return result;
}

export async function applySyncOperations(
  accountId: string,
  operations:
    SyncOperation[],
) {
  return mutate(
    (database) => {
      const accepted:
        string[] = [];
      const conflicts:
        Array<{
          operation:
            SyncOperation;
          serverRecord:
            SyncRecord;
        }> = [];

      for (const operation of operations) {
        const existing =
          database.records.find(
            (record) =>
              record.accountId ===
                accountId &&
              record.entityType ===
                operation.entityType &&
              record.entityId ===
                operation.entityId,
          );

        if (
          existing &&
          existing.revision !==
            operation.baseRevision
        ) {
          conflicts.push({
            operation,
            serverRecord:
              existing,
          });
          continue;
        }

        const now =
          new Date().toISOString();
        const record:
          SyncRecord = {
            id:
              existing?.id ??
              randomUUID(),
            accountId,
            entityType:
              operation.entityType,
            entityId:
              operation.entityId,
            payload:
              operation.payload ??
              existing?.payload ??
              {},
            revision:
              (existing?.revision ??
                0) + 1,
            deviceId:
              operation.deviceId,
            createdAt:
              existing?.createdAt ??
              now,
            updatedAt: now,
            deletedAt:
              operation.operation ===
              "delete"
                ? now
                : undefined,
          };

        if (existing) {
          Object.assign(
            existing,
            record,
          );
        } else {
          database.records.push(
            record,
          );
        }
        accepted.push(
          operation.id,
        );
      }

      return {
        accepted,
        conflicts,
      };
    },
  );
}

export async function listAccountDevices(
  accountId: string,
) {
  const database =
    await read();
  return database.devices.filter(
    (device) =>
      device.accountId ===
      accountId,
  );
}

export async function registerDevice(
  device:
    DeviceRecord,
) {
  return mutate(
    (database) => {
      const existing =
        database.devices.find(
          (item) =>
            item.id ===
            device.id &&
            item.accountId ===
            device.accountId,
        );
      if (existing) {
        Object.assign(
          existing,
          device,
        );
        return existing;
      }
      database.devices.push(
        device,
      );
      return device;
    },
  );
}

export async function revokeDevice(
  accountId: string,
  deviceId: string,
) {
  return mutate(
    (database) => {
      const device =
        database.devices.find(
          (item) =>
            item.id ===
              deviceId &&
            item.accountId ===
              accountId,
        );
      if (!device) {
        return false;
      }
      device.revokedAt =
        new Date().toISOString();
      return true;
    },
  );
}

export async function createRestorePoint(
  backup:
    BackupRecord,
) {
  return mutate(
    (database) => {
      database.backups.push(
        backup,
      );
      database.backups =
        database.backups
          .sort(
            (a, b) =>
              b.createdAt.localeCompare(
                a.createdAt,
              ),
          )
          .slice(0, 100);
      return backup;
    },
  );
}

export async function listRestorePoints(
  accountId: string,
) {
  const database =
    await read();
  return database.backups.filter(
    (backup) =>
      backup.accountId ===
      accountId,
  );
}
