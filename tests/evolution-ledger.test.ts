import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createEmptyEvolutionLedger,
} from "@/lib/evolution/evolution-ledger";

describe("Evolution ledger", () => {
  it("creates a versioned empty ledger", () => {
    const ledger =
      createEmptyEvolutionLedger();

    expect(
      ledger.schemaVersion,
    ).toBe(1);
    expect(ledger.snapshots).toEqual([]);
    expect(
      ledger.createdAt.length,
    ).toBeGreaterThan(10);
  });
});
