import {
  describe,
  expect,
  it,
} from "vitest";

import {
  emptyMemoryLedger,
} from "@/lib/memory/store";

describe("Memory ledger contract", () => {
  it("starts with a versioned empty ledger", () => {
    expect(
      emptyMemoryLedger(),
    ).toEqual({
      version: 1,
      events: [],
    });
  });
});
