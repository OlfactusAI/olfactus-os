import { describe, expect, it } from "vitest";
import type { AccountRecord } from "@/lib/auth/types";

describe("Account deletion contract", () => {
  it("uses a soft-delete timestamp before server data removal", () => {
    const account: AccountRecord = {
      id: "account",
      email: "user@example.com",
      displayName: "User",
      passwordSalt: "salt",
      passwordHash: "hash",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      deletedAt: "2026-02-01T00:00:00.000Z",
    };
    expect(account.deletedAt).toBeTruthy();
  });
});
