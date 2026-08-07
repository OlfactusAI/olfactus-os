import type { FragranceRecord } from "@/lib/domain/fragrance";
import { buildGlobalEntityRegistry } from "@/lib/graph/entity-registry-v2";
import { buildGlobalRelationships } from "@/lib/graph/relationship-engine";
import type { GlobalIntelligenceGraph } from "@/lib/graph/global-types";

export function buildGlobalIntelligenceGraph(catalog: FragranceRecord[]): GlobalIntelligenceGraph {
  const registry = buildGlobalEntityRegistry(catalog);
  return {
    graphVersion: "GIN-1.0.0",
    generatedAt: new Date().toISOString(),
    entities: registry.entities,
    relationships: buildGlobalRelationships({ catalog, registry }),
  };
}
