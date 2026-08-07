import {
  describe,
  expect,
  it,
} from "vitest";
import type {
  SyncConflict,
} from "@/lib/server/postgres/types";

describe("Field-level conflict review", () => {
  it("preserves both local and server values", () => {
    const conflict: SyncConflict = {
      id: "conflict-1",
      entityType: "collection-item",
      entityId: "aventus",
      detectedAt: new Date().toISOString(),
      localOperation: {
        id: "local",
        entityType: "collection-item",
        entityId: "aventus",
        operation: "upsert",
        baseRevision: 2,
        deviceId: "phone",
        payload: { purchasePrice: 210 },
        createdAt: new Date().toISOString(),
      },
      serverRecord: {
        id: "server",
        accountId: "account",
        entityType: "collection-item",
        entityId: "aventus",
        payload: { purchasePrice: 225 },
        revision: 3,
        deviceId: "laptop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    expect(conflict.localOperation.payload?.purchasePrice).toBe(210);
    expect(conflict.serverRecord.payload.purchasePrice).toBe(225);
  });
});
