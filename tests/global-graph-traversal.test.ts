import { describe, expect, it } from "vitest";
import { bundledIntelligenceCatalog } from "@/lib/data/intelligence-catalog";
import { createGlobalIntelligenceService } from "@/lib/graph/global-intelligence-service";

describe("Global Graph Traversal", () => {
  it("finds a path from Aventus to Creed", () => {
    const service = createGlobalIntelligenceService(bundledIntelligenceCatalog);
    const aventus = service.searchEntities("Aventus").find((item) => item.type === "fragrance");
    const creed = service.searchEntities("Creed").find((item) => item.type === "brand");
    expect(aventus).toBeTruthy();
    expect(creed).toBeTruthy();
    const path = service.findShortestPath(aventus!.canonicalId, creed!.canonicalId);
    expect(path.found).toBe(true);
  });
});
