import {
  describe,
  expect,
  it,
} from "vitest";
import type {
  SyncOperation,
} from "@/lib/server/postgres/types";

describe("Offline sync queue contract", () => {
  it("retains entity revision and device identity", () => {
    const operation: SyncOperation = {
      id: "operation-1",
      entityType: "collection-item",
      entityId: "aventus",
      operation: "upsert",
      baseRevision: 4,
      deviceId: "macbook",
      payload: { favorite: true },
      createdAt: new Date().toISOString(),
    };
    expect(operation.baseRevision).toBe(4);
    expect(operation.deviceId).toBe("macbook");
  });
});
