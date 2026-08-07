import type { FragranceRecord } from "@/lib/domain/fragrance";
import { buildGlobalIntelligenceGraph } from "@/lib/graph/graph-engine";
import { calculateGlobalGraphMetrics } from "@/lib/graph/graph-metrics";
import {
  findBrandPortfolio,
  findGlobalNeighbors,
  findPerfumerPortfolio,
  findSharedEntities,
  findSimilarFragrances,
} from "@/lib/graph/query-engine";
import { findShortestGlobalPath } from "@/lib/graph/traversal-engine";
import {
  buildGlobalEntityRegistry,
  entityId,
  findRegistryEntities,
} from "@/lib/graph/entity-registry-v2";

export function createGlobalIntelligenceService(catalog: FragranceRecord[]) {
  const registry = buildGlobalEntityRegistry(catalog);
  const graph = buildGlobalIntelligenceGraph(catalog);
  const metrics = calculateGlobalGraphMetrics(graph);

  return {
    graph,
    metrics,
    searchEntities: (query: string) => findRegistryEntities(registry, query),
    getNeighbors: (canonicalId: string) => findGlobalNeighbors({ graph, entityId: canonicalId }),
    findSimilar: (fragranceId: string) =>
      findSimilarFragrances(graph, entityId("fragrance", fragranceId)),
    findBrandPortfolio: (brand: string) =>
      findBrandPortfolio(graph, entityId("brand", brand)),
    findPerfumerPortfolio: (perfumer: string) =>
      findPerfumerPortfolio(graph, entityId("perfumer", perfumer)),
    findSharedAccords: (leftId: string, rightId: string) =>
      findSharedEntities(
        graph,
        entityId("fragrance", leftId),
        entityId("fragrance", rightId),
        "uses-accord",
        "accord",
      ),
    findSharedIngredients: (leftId: string, rightId: string) =>
      findSharedEntities(
        graph,
        entityId("fragrance", leftId),
        entityId("fragrance", rightId),
        "uses-ingredient",
        "ingredient",
      ),
    findShortestPath: (leftCanonicalId: string, rightCanonicalId: string) =>
      findShortestGlobalPath({
        graph,
        startId: leftCanonicalId,
        targetId: rightCanonicalId,
      }),
  };
}

export type GlobalIntelligenceService =
  ReturnType<typeof createGlobalIntelligenceService>;
