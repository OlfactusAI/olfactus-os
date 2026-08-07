import { describe, expect, it } from "vitest";
import { bundledIntelligenceCatalog } from "@/lib/data/intelligence-catalog";
import { createGlobalIntelligenceService } from "@/lib/graph/global-intelligence-service";

describe("Global Graph Query API", () => {
  it("searches entities and returns graph neighbors", () => {
    const service = createGlobalIntelligenceService(bundledIntelligenceCatalog);
    const aventus = service.searchEntities("Aventus").find((entity) => entity.type === "fragrance");
    expect(aventus).toBeTruthy();
    expect(service.getNeighbors(aventus!.canonicalId).length).toBeGreaterThan(0);
  });
});
