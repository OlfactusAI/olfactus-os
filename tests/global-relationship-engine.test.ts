import { describe, expect, it } from "vitest";
import { bundledIntelligenceCatalog } from "@/lib/data/intelligence-catalog";
import { buildGlobalEntityRegistry } from "@/lib/graph/entity-registry-v2";
import { buildGlobalRelationships } from "@/lib/graph/relationship-engine";

describe("Global Relationship Engine", () => {
  it("builds typed relationships with bounded confidence", () => {
    const registry = buildGlobalEntityRegistry(bundledIntelligenceCatalog);
    const relationships = buildGlobalRelationships({ catalog: bundledIntelligenceCatalog, registry });
    expect(relationships.length).toBeGreaterThan(bundledIntelligenceCatalog.length);
    expect(relationships.some((item) => item.type === "belongs-to-brand")).toBe(true);
    expect(relationships.some((item) => item.type === "similar-to")).toBe(true);
    expect(relationships.every((item) => item.confidence >= 0 && item.confidence <= 100)).toBe(true);
  });
});
