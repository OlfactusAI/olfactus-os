"use client";

import {
  useEffect, useMemo, useState } from "react";
import {
  Activity,
  BrainCircuit,
  GitBranch,
  Network,
  Orbit,
  Search,
  Sparkles,
} from "lucide-react";

import { GraphNodeInspector } from "@/components/graph/graph-node-inspector";
import { NeuralGraphSearch } from "@/components/graph/neural-graph-search";
import { GraphIntelligenceBriefing } from "@/components/graph/graph-intelligence-briefing";
import { GraphRelationshipComparison } from "@/components/graph/graph-relationship-comparison";
import { KnowledgeGraphCanvas } from "@/components/graph/knowledge-graph-canvas";
import { useCollection } from "@/components/providers/collection-provider";
import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";
import {
  buildKnowledgeGraph,
  findRecommendationPath,
  getGraphMetrics,
} from "@/lib/intelligence/knowledge-graph-engine";
import {
  executeNeuralGraphSearch,
  parseNeuralGraphQuery,
  type NeuralGraphSearchOutput,
} from "@/lib/intelligence/neural-graph-search";
import { analyzeGraphIntelligence } from "@/lib/intelligence/graph-intelligence-engine";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import { inferLineageRegistry } from "@/lib/lineage/inference";
import { analyzeLineageIntelligence } from "@/lib/intelligence/lineage-intelligence-engine";
import { augmentKnowledgeGraphWithLineage } from "@/lib/intelligence/lineage-graph-integration";
import { activateDynamicKnowledgeGraph } from "@/lib/intelligence/dynamic-graph-runtime";
import {
  loadGraphSelection,
  saveGraphSelection,
} from "@/lib/intelligence/graph-session";
import { useTimelineLedger } from "@/components/timeline/use-timeline-ledger";

export default function GraphPage() {
  const { owned, items, hydrated } =
    useCollection();
  const { ledger } = useTimelineLedger();

  const {
    catalog,
    importedIds,
    readinessById,
    isHydrated: catalogHydrated,
  } = useActiveFragranceCatalog();
  const ownedIds = useMemo(
    () =>
      new Set(
        owned.map(
          ({ fragrance }) =>
            fragrance.id,
        ),
      ),
    [owned],
  );

  const graph = useMemo(
    () => {
      const baseGraph =
        buildKnowledgeGraph({
          catalog,
          ownedIds,
        });
      const database =
        buildGlobalFragranceDatabase({
          catalog,
        });
      const registry =
        inferLineageRegistry(database);
      const lineage =
        analyzeLineageIntelligence({
          database,
          registry,
          inferMissing: false,
        });

      const lineageGraph = augmentKnowledgeGraphWithLineage({ graph: baseGraph, lineage });
      return activateDynamicKnowledgeGraph({ graph: lineageGraph, catalog, collection: items, timeline: ledger.events, recommendationIds: owned.slice(0, 2).map(({ fragrance }) => fragrance.id) });
    },
    [catalog, items, ledger.events, owned, ownedIds],
  );

  const metrics = useMemo(
    () => getGraphMetrics(graph),
    [catalog, graph],
  );

  const graphIntelligence = useMemo(
    () =>
      analyzeGraphIntelligence({
        graph,
        catalog,
      }),
    [graph],
  );

  const wearCounts = useMemo(
    () =>
      new Map(
        owned.map(({ item, fragrance }) => [
          fragrance.id,
          item.wearCount,
        ]),
      ),
    [owned],
  );

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(() => {
      const firstOwned =
        graph.nodes.find(
          (node) =>
            node.type === "fragrance" &&
            node.owned,
        );
      return firstOwned?.id ?? null;
    });

  const [comparisonNodeId, setComparisonNodeId] =
    useState<string | null>(null);

  useEffect(() => {
    const stored =
      loadGraphSelection();

    if (
      stored.selectedNodeId &&
      graph.nodes.some(
        (node) =>
          node.id ===
          stored.selectedNodeId,
      )
    ) {
      setSelectedNodeId(
        stored.selectedNodeId,
      );
    }

    if (
      stored.comparisonNodeId &&
      graph.nodes.some(
        (node) =>
          node.id ===
          stored.comparisonNodeId,
      )
    ) {
      setComparisonNodeId(
        stored.comparisonNodeId,
      );
    }
  }, [graph.nodes]);

  useEffect(() => {
    saveGraphSelection({
      selectedNodeId,
      comparisonNodeId,
    });
  }, [
    comparisonNodeId,
    selectedNodeId,
  ]);
  const [searchQuery, setSearchQuery] =
    useState("");
  const [searchResult, setSearchResult] =
    useState<NeuralGraphSearchOutput | null>(null);

  const selectedNode =
    graph.nodes.find(
      (node) =>
        node.id === selectedNodeId,
    ) ?? null;

  const comparisonNode =
    graph.nodes.find(
      (node) =>
        node.id === comparisonNodeId,
    ) ?? null;

  const recommendationPath = useMemo(() => {
    const firstOwned =
      owned[0]?.fragrance.id;
    return firstOwned
      ? findRecommendationPath({
          graph,
          startFragranceId:
            firstOwned,
          maximumSteps: 5,
        })
      : [];
  }, [graph, owned]);

  function runNeuralSearch() {
    if (!searchQuery.trim()) return;

    const parsed =
      parseNeuralGraphQuery(
        searchQuery,
      );
    const result =
      executeNeuralGraphSearch({
        graph,
        catalog,
        query: parsed,
        wearCounts,
      });

    setSearchResult(result);

    if (result.results[0]) {
      setSelectedNodeId(
        result.results[0].node.id,
      );
    }
  }

  return (
    <div className="knowledge-graph-page pb-12">
      <section className="graph-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="graph-grid pointer-events-none absolute inset-0" />
        <div className="graph-aura pointer-events-none absolute -right-48 -top-52 h-[780px] w-[780px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="graph-command-mark">
              <Network size={18} />
            </span>
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.24em] text-[var(--gold-bright)]">
                OLFACTUS Knowledge Graph
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Shared relationship intelligence · {graph.version}
              </p>
            </div>
          </div>
          <span className="graph-status-chip">
            Graph synchronized
          </span>
        </div>

        <div className="relative mt-10 grid gap-10 xl:grid-cols-[1.12fr_.88fr] xl:items-end">
          <div>
            <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
              Collection Ecosystem
            </p>
            <h1 className="display-serif mt-5 text-[clamp(3.8rem,7.1vw,7.5rem)] leading-[.88] tracking-[-.055em]">
              Every fragrance.
              <span className="block text-[var(--gold-bright)]">
                Every relationship.
              </span>
            </h1>
            <p className="mt-8 max-w-4xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              OLFACTUS has organized the fragrance catalog into{" "}
              {metrics.nodeCount} connected knowledge nodes and{" "}
              {metrics.edgeCount} weighted relationships.{" "}
              {metrics.strongestBridge
                ? `${metrics.strongestBridge.fragranceName} currently has the strongest bridge position across the detected collection ecosystems.`
                : "Bridge intelligence is still calibrating."}
            </p>
          </div>

          <div className="graph-hero-summary graph-panel">
            <div className="flex items-center gap-3">
              <BrainCircuit
                size={17}
                className="text-[var(--gold)]"
              />
              <p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
                Graph Intelligence
              </p>
            </div>
            <p className="display-serif mt-5 text-4xl">
              {metrics.largestCluster?.label ??
                "Calibrating"}{" "}
              Cluster
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              The largest detected cluster contains{" "}
              {metrics.largestCluster?.nodeIds
                .length ?? 0}{" "}
              fragrances with an average internal relationship strength of{" "}
              {metrics.largestCluster?.averageStrength ??
                0}/100.
            </p>
          </div>
        </div>

        <div className="relative mt-9 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label="Graph Nodes"
            value={metrics.nodeCount}
          />
          <HeroMetric
            label="Relationships"
            value={metrics.edgeCount}
          />
          <HeroMetric
            label="Connectivity"
            value={metrics.connectivity}
            suffix="%"
          />
          <HeroMetric
            label="Avg. Strength"
            value={
              metrics.averageRelationshipStrength
            }
          />
        </div>
      </section>

      <div className="mt-8">
        <NeuralGraphSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={runNeuralSearch}
          result={searchResult}
          onSelectNode={setSelectedNodeId}
        />
      </div>

      <div className="mt-8">
        <GraphIntelligenceBriefing
          analysis={graphIntelligence}
          onSelectNode={setSelectedNodeId}
        />
      </div>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <article className="graph-panel rounded-[32px] border border-[var(--border)] p-5 sm:p-7">
          <KnowledgeGraphCanvas
            graph={graph}
            selectedNodeId={selectedNodeId}
            comparisonNodeId={comparisonNodeId}
            onSelectNode={setSelectedNodeId}
            onSelectComparisonNode={setComparisonNodeId}
          />
        </article>

        <GraphNodeInspector
          graph={graph}
          node={selectedNode}
          onSelectNode={setSelectedNodeId}
        />
      </section>

      <div className="mt-8">
        <GraphRelationshipComparison
          graph={graph}
          firstNode={selectedNode}
          secondNode={comparisonNode}
          catalog={catalog}
          onClear={() => setComparisonNodeId(null)}
        />
      </div>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.04fr_.96fr]">
        <article className="graph-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
                Collection Clusters
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Dominant scent ecosystems.
              </h2>
            </div>
            <Orbit
              size={44}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {graph.clusters.map(
              (cluster, index) => (
                <div
                  key={cluster.id}
                  className="graph-cluster-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="display-serif text-2xl text-[var(--gold)]">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <span className="text-sm text-[var(--gold-bright)]">
                      {cluster.nodeIds.length} fragrances
                    </span>
                  </div>
                  <p className="display-serif mt-4 text-3xl">
                    {cluster.label}
                  </p>
                  <p className="mt-3 text-sm capitalize text-[var(--muted)]">
                    {cluster.dominantDna.join(
                      " · ",
                    )}
                  </p>
                  <div className="graph-progress mt-5">
                    <span
                      style={{
                        width: `${cluster.averageStrength}%`,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="graph-panel graph-path-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <GitBranch
              size={18}
              className="text-[var(--gold-bright)]"
            />
            <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
              Recommendation Path
            </p>
          </div>
          <h2 className="display-serif mt-4 text-4xl">
            A navigable path from current taste to new territory.
          </h2>

          <div className="mt-8">
            {recommendationPath.map(
              (node, index) => (
                <div
                  key={node.id}
                  className="graph-path-step"
                >
                  {index <
                  recommendationPath.length -
                    1 ? (
                    <span className="graph-path-line" />
                  ) : null}
                  <span className="graph-path-dot">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs text-[var(--gold)]">
                      {node.subtitle}
                    </p>
                    <p className="display-serif mt-1 text-3xl">
                      {node.label}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {node.owned
                        ? "Current collection anchor"
                        : "Recommended graph progression"}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <InsightCard
          icon={<Activity size={17} />}
          label="Strongest Bridge"
          value={
            metrics.strongestBridge
              ?.fragranceName ??
            "Calibrating"
          }
          explanation={
            metrics.strongestBridge
              ? `Bridge score ${metrics.strongestBridge.bridgeScore}/100 across ${Math.max(
                  1,
                  metrics.strongestBridge
                    .clusterConnections
                    .length,
                )} detected clusters.`
              : "More relationships are required."
          }
        />
        <InsightCard
          icon={<Sparkles size={17} />}
          label="Largest Ecosystem"
          value={
            metrics.largestCluster
              ?.label ?? "Calibrating"
          }
          explanation={`${metrics.largestCluster?.nodeIds.length ?? 0} fragrance nodes form the largest connected region.`}
        />
        <InsightCard
          icon={<Search size={17} />}
          label="Graph Foundation"
          value="Query Ready"
          explanation="The shared graph API now supports neighborhoods, bridges, clusters, search, metrics, and recommendation paths."
        />
      </section>

      {!hydrated ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Synchronizing collection status with the Knowledge Graph…
        </p>
      ) : null}
    </div>
  );
}

function HeroMetric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="graph-hero-metric">
      <p className="text-[.56rem] font-bold uppercase tracking-[.13em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-4xl text-[var(--gold-bright)]">
        {value}
        {suffix}
      </p>
    </div>
  );
}

function InsightCard({
  icon,
  label,
  value,
  explanation,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  explanation: string;
}) {
  return (
    <article className="graph-panel rounded-[28px] border border-[var(--border)] p-7">
      <div className="flex items-center gap-3 text-[var(--gold)]">
        {icon}
        <p className="text-[.6rem] font-bold uppercase tracking-[.17em]">
          {label}
        </p>
      </div>
      <p className="display-serif mt-5 text-3xl">
        {value}
      </p>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {explanation}
      </p>
    </article>
  );
}
