import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Global Intelligence API contract", () => {
  it("exposes the Global Intelligence Network through the unified API", () => {
    const source = readFileSync(join(process.cwd(), "lib/intelligence-api/index.ts"), "utf8");
    expect(source).toContain("createGlobalIntelligenceService");
    expect(source).toContain("getGlobalGraphContext()");
    expect(source).toContain("searchGlobalEntities");
    expect(source).toContain("findGlobalSimilarFragrances");
  });
});
