import { describe, expect, it } from "vitest";
import type { OlfactusBackup } from "@/lib/system/backup";

describe("OLFACTUS backup format", () => {
  it("uses a versioned portable envelope", () => {
    const backup: OlfactusBackup = {
      format: "OLFACTUS_BACKUP_V1",
      exportedAt: new Date().toISOString(),
      appVersion: "2.1.0-alpha.3",
      data: { "olfactus.collection.v1": "[]" },
    };
    expect(backup.format).toBe("OLFACTUS_BACKUP_V1");
    expect(Object.keys(backup.data)).toContain("olfactus.collection.v1");
  });
});
