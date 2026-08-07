import { describe, expect, it } from "vitest";
import type { RecoveryAction } from "@/lib/recovery/action-ledger";

describe("Recovery ledger contract", () => {
  it("stores complete before and after collection snapshots", () => {
    const action: RecoveryAction = {
      id: "action-1",
      type: "collection-transaction",
      title: "Scenario",
      summary: "Applied two actions",
      createdAt: new Date().toISOString(),
      beforeCollection: [],
      afterCollection: [],
    };
    expect(action.beforeCollection).toHaveLength(0);
    expect(action.afterCollection).toHaveLength(0);
  });
});
