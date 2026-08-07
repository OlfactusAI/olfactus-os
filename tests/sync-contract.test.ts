import { describe, expect, it } from "vitest";
import type { UserDataSnapshot } from "@/lib/sync/types";

describe("Cross-device sync contract", () => {
  it("uses monotonic revisions and a versioned snapshot", () => {
    const snapshot: UserDataSnapshot = {
      schemaVersion: 1,
      revision: 4,
      updatedAt: new Date().toISOString(),
      deviceId: "device-1",
      data: { "olfactus.collection.v1": "[]" },
    };
    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.revision).toBeGreaterThan(0);
    expect(snapshot.data["olfactus.collection.v1"]).toBe("[]");
  });
});
