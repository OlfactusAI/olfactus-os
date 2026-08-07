import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("System Global Intelligence Network diagnostics", () => {
  it("renders global graph diagnostics", () => {
    const source = readFileSync(join(process.cwd(), "app/(app)/system/page.tsx"), "utf8");
    expect(source).toContain("Global Intelligence Network");
    expect(source).toContain("globalGraphMetrics");
    expect(source).toContain("Average degree");
    expect(source).toContain("Integrity");
  });
});
