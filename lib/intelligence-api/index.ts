import {
  createUnifiedRegistry,
  type OlfactusUnifiedRegistry,
} from "@/lib/platform/unified-registry";
import { buildRecommendationExplanationV2 } from "@/lib/recommendation-v2/explanation-view-model";
import { runNeuralRecommendationEngineV2 } from "@/lib/recommendation-v2/engine";
import { buildGraphRecommendationContext } from "@/lib/graph/recommendation-context";
import { calculateRelationshipCoverage } from "@/lib/graph/relationship-coverage";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  CanonicalCollectorState,
} from "@/lib/collector-state/types";
import type {
  PersonalIntelligenceGraph,
} from "@/lib/personal-graph/types";
import {
  listActiveIntelligenceModels,
} from "@/lib/models/registry";
import {
  buildCollectorPreferenceEmbedding,
} from "@/lib/embedding/collector-preference";
import {
  embedFragrance,
} from "@/lib/embedding/fragrance-embedding";
import {
  interpretFragranceRequest,
} from "@/lib/language/interpreter";
import {
  findSemanticCandidates,
} from "@/lib/semantic/search";
import {
  compareFragrancesInPreferenceSpace,
} from "@/lib/semantic/relative-comparison";
import {
  analyzeCollectionHealth,
} from "@/lib/intelligence/collection-health";

export interface IntelligenceApiContext {
  state: CanonicalCollectorState;
  graph: PersonalIntelligenceGraph;
  catalog: FragranceRecord[];
  registry?: OlfactusUnifiedRegistry;
}

export function createIntelligenceApi({
  state,
  graph,
  catalog,
  registry: providedRegistry,
}: IntelligenceApiContext) {
  const registry =
    providedRegistry ??
    createUnifiedRegistry({
      state,
      graph,
      catalog,
    });

  const fragranceById =
    registry.catalog.byId;
  const graphNodeById =
    registry.graph.personalNodeById;
  const globalIntelligence =
    registry.graph.global;

  return {
    getRegistry() {
      return registry;
    },

    getCollectorState() {
      return registry.collector.state;
    },

    getCatalogContext() {
      return registry.catalog.records;
    },

    getCollectionHealthContext() {
      return analyzeCollectionHealth({
        collection:
          state.collection,
        catalog,
        profile:
          state.profile,
      });
    },

    getOwnedFragrances() {
      return state.ownership
        .map(
          (ownership) => {
            const fragrance =
              fragranceById.get(
                ownership.fragranceId,
              );

            return fragrance
              ? {
                  fragrance,
                  item:
                    state.collection.find(
                      (item) =>
                        item.fragranceId ===
                        ownership.fragranceId,
                    )!,
                }
              : null;
          },
        )
        .filter(
          (
            entry,
          ): entry is {
            fragrance:
              FragranceRecord;
            item:
              CanonicalCollectorState["collection"][number];
          } =>
            Boolean(entry),
        );
    },

    getPreferenceProfile() {
      return state.preferences;
    },

    getMemoryContext() {
      return {
        summary: state.memory.summary,
        insights: state.memory.insights,
        eventState: state.behavior.eventState,
      };
    },

    getPredictionContext() {
      return state.prediction;
    },

    getRecommendationContext() {
      return {
        ownedIds: new Set(
          state.ownership.map((item) => item.fragranceId),
        ),
        familyAffinities: state.preferences.families,
        accordAffinities: state.preferences.accords,
        collectorDna: state.preferences.collectorDna,
        forecast: state.prediction.collectionForecast,
        confidence: state.confidence,
      };
    },

    getFragranceState(fragranceId: string) {
      const fragrance = fragranceById.get(fragranceId);
      const ownership = state.ownership.find(
        (item) => item.fragranceId === fragranceId,
      );
      const prediction =
        state.prediction.snapshot.bottlePredictions.find(
          (item) => item.fragranceId === fragranceId,
        );
      const personalNode = graphNodeById.get(
        `fragrance:${fragranceId}`,
      );
      const relationships = graph.edges.filter(
        (edge) => edge.to === personalNode?.id,
      );

      return {
        fragrance,
        ownership,
        prediction,
        personalNode,
        relationships,
      };
    },

    getGraphContext() {
      return registry.graph.personal;
    },

    getGlobalGraphContext() {
      return globalIntelligence.graph;
    },

    getGlobalGraphMetrics() {
      return globalIntelligence.metrics;
    },

    getNeuralRecommendationsV2({
      budget,
      season,
      temperatureF,
      limit,
    }: {
      budget?: number;
      season?: import("@/lib/domain/fragrance").Season;
      temperatureF?: number;
      limit?: number;
    } = {}) {
      const collectorState =
        this.getCollectorState();
      const activeCatalog =
        this.getCatalogContext();

      return runNeuralRecommendationEngineV2({
        catalog:
          activeCatalog,
        collection:
          collectorState.collection,
        budget,
        season,
        temperatureF,
        limit,
      });
    },

    getRecommendationExplanationV2({
      candidateId,
      budget,
      season,
      temperatureF,
    }: {
      candidateId?: string;
      budget?: number;
      season?: import("@/lib/domain/fragrance").Season;
      temperatureF?: number;
    } = {}) {
      const run =
        this.getNeuralRecommendationsV2({
          budget,
          season,
          temperatureF,
          limit: 20,
        });

      const candidate =
        candidateId
          ? run.candidates.find(
              (item) =>
                item.fragrance.id ===
                candidateId,
            )
          : run.candidates[0];

      if (!candidate) {
        return null;
      }

      const collectorState =
        this.getCollectorState();
      const catalog =
        this.getCatalogContext();

      return buildRecommendationExplanationV2({
        candidate,
        collection:
          collectorState.collection,
        catalog,
      });
    },

    getGlobalRelationshipCoverage() {
      return calculateRelationshipCoverage(globalIntelligence.graph);
    },

    getGraphRecommendationContext(fragranceId: string) {
      return buildGraphRecommendationContext({ service: globalIntelligence, fragranceId });
    },

    searchGlobalEntities(query: string) {
      return globalIntelligence.searchEntities(query);
    },

    findGlobalSimilarFragrances(fragranceId: string) {
      return globalIntelligence.findSimilar(fragranceId);
    },

    findGlobalBrandPortfolio(brand: string) {
      return globalIntelligence.findBrandPortfolio(brand);
    },

    findGlobalPerfumerPortfolio(perfumer: string) {
      return globalIntelligence.findPerfumerPortfolio(perfumer);
    },

    findGlobalSharedAccords(leftId: string, rightId: string) {
      return globalIntelligence.findSharedAccords(leftId, rightId);
    },

    findGlobalSharedIngredients(leftId: string, rightId: string) {
      return globalIntelligence.findSharedIngredients(leftId, rightId);
    },

    findGlobalRelationshipPath(leftId: string, rightId: string) {
      return globalIntelligence.findShortestPath(leftId, rightId);
    },

    getModelContext() {
      return listActiveIntelligenceModels();
    },

    getPreferenceEmbedding() {
      return buildCollectorPreferenceEmbedding({
        state,
        catalog,
      });
    },

    getFragranceEmbedding(
      fragranceId: string,
    ) {
      const fragrance =
        fragranceById.get(
          fragranceId,
        );

      return fragrance
        ? embedFragrance(
            fragrance,
          )
        : undefined;
    },

    interpretFragranceRequest(
      text: string,
    ) {
      return interpretFragranceRequest({
        text,
        catalog,
        collectorEmbedding:
          buildCollectorPreferenceEmbedding({
            state,
            catalog,
          }),
      });
    },

    findSemanticCandidates(
      text: string,
      limit = 20,
    ) {
      const collectorEmbedding =
        buildCollectorPreferenceEmbedding({
          state,
          catalog,
        });
      const request =
        interpretFragranceRequest({
          text,
          catalog,
          collectorEmbedding,
        });

      return findSemanticCandidates({
        request,
        collectorEmbedding,
        catalog,
        ownedIds:
          new Set(
            state.ownership.map(
              (item) =>
                item.fragranceId,
            ),
          ),
        limit,
      });
    },

    compareInPreferenceSpace(
      leftFragranceId: string,
      rightFragranceId: string,
    ) {
      const left =
        fragranceById.get(
          leftFragranceId,
        );
      const right =
        fragranceById.get(
          rightFragranceId,
        );

      return left &&
        right
        ? compareFragrancesInPreferenceSpace({
            a: left,
            b: right,
          })
        : [];
    },

    searchPersonalGraph(query: string) {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return [];

      return graph.nodes
        .filter(
          (node) =>
            node.label.toLowerCase().includes(normalized) ||
            node.id.toLowerCase().includes(normalized),
        )
        .slice(0, 30);
    },
  };
}

export type OlfactusIntelligenceApi =
  ReturnType<typeof createIntelligenceApi>;
