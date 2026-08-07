import { describe, expect, it } from "vitest";
import { normalizeDisplayName, normalizeEmail } from "@/lib/auth/validation";

describe("Account validation", () => {
  it("normalizes account identity fields", () => {
    expect(normalizeEmail(" Test@Example.COM ")).toBe("test@example.com");
    expect(normalizeDisplayName(" Steve ")).toBe("Steve");
  });

  it("rejects malformed account fields", () => {
    expect(() => normalizeEmail("not-an-email")).toThrow();
    expect(() => normalizeDisplayName("x")).toThrow();
  });
});
