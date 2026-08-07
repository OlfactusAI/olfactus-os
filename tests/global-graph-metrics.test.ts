import { describe, expect, it } from "vitest";
import { bundledIntelligenceCatalog } from "@/lib/data/intelligence-catalog";
import { createGlobalIntelligenceService } from "@/lib/graph/global-intelligence-service";

describe("Global Graph Metrics", () => {
  it("reports graph scale and integrity", () => {
    const service = createGlobalIntelligenceService(bundledIntelligenceCatalog);
    expect(service.metrics.graphVersion).toBe("GIN-1.0.0");
    expect(service.metrics.entityCount).toBeGreaterThan(bundledIntelligenceCatalog.length);
    expect(service.metrics.relationshipCount).toBeGreaterThan(0);
    expect(service.metrics.integrityScore).toBeGreaterThanOrEqual(90);
  });
});
