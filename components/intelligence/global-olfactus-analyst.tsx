"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Network,
  Landmark,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useCollection } from "@/components/providers/collection-provider";
import { fragrances } from "@/lib/data/fragrances";
import {
  createUnifiedKnowledgeGraph,
  getUnifiedGraphSignal,
} from "@/lib/intelligence/unified-graph-intelligence";
import { getGraphMetrics } from "@/lib/intelligence/knowledge-graph-engine";
import { analyzeCollectionValueDashboard } from "@/lib/intelligence/collection-value-dashboard";

export function GlobalOlfactusAnalyst() {
  const pathname = usePathname();
  const { owned, items, analysis, hydrated } =
    useCollection();
  const [expanded, setExpanded] =
    useState(false);

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
    () =>
      createUnifiedKnowledgeGraph({
        catalog: fragrances,
        ownedIds,
      }),
    [ownedIds],
  );

  const metrics = useMemo(
    () => getGraphMetrics(graph),
    [graph],
  );

  const marketPortfolio = useMemo(
    () =>
      analyzeCollectionValueDashboard({
        collection: items,
        catalog: fragrances,
      }),
    [items],
  );

  const anchorId =
    owned[0]?.fragrance.id ??
    fragrances[0]?.id;

  const anchorSignal = useMemo(
    () =>
      anchorId
        ? getUnifiedGraphSignal({
            graph,
            catalog: fragrances,
            fragranceId: anchorId,
          })
        : null,
    [anchorId, graph],
  );

  if (
    !hydrated ||
    pathname === "/graph"
  ) {
    return null;
  }

  const pageLabel =
    pathname === "/today"
      ? "Today's intelligence"
      : pathname === "/discover"
        ? "Discovery intelligence"
        : pathname === "/decisions"
          ? "Decision intelligence"
          : pathname === "/genome"
            ? "Genome intelligence"
            : pathname === "/timeline"
              ? "Timeline intelligence"
              : pathname === "/market"
                ? "Market intelligence"
                : pathname === "/deal-lab"
                  ? "Deal intelligence"
                  : "Collection intelligence";

  return (
    <aside
      className={`global-analyst ${
        expanded ? "is-expanded" : ""
      }`}
      aria-label="OLFACTUS Analyst"
    >
      <button
        type="button"
        className="global-analyst-header"
        onClick={() =>
          setExpanded((value) => !value)
        }
        aria-expanded={expanded}
      >
        <span className="global-analyst-mark">
          <BrainCircuit size={16} />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <strong>OLFACTUS Analyst</strong>
          <small>{pageLabel}</small>
        </span>
        {expanded ? (
          <ChevronDown size={15} />
        ) : (
          <ChevronUp size={15} />
        )}
      </button>

      {expanded ? (
        <div className="global-analyst-body">
          <p className="display-serif text-2xl leading-[1.25]">
            Your collection contains{" "}
            {graph.clusters.length} detected
            scent ecosystems with{" "}
            {metrics.connectivity}% graph
            connectivity.
          </p>

          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Collection Health is{" "}
            {analysis.score}/100 and estimated
            portfolio value is{" "}
            ${marketPortfolio.estimatedMarketValue.toLocaleString()}.
            {" "}
            {metrics.strongestBridge
              ? `${metrics.strongestBridge.fragranceName} is currently the strongest bridge node.`
              : "Bridge intelligence is still calibrating."}{" "}
            {anchorSignal
              ? `The current anchor carries ${anchorSignal.strategicValue}/100 strategic value.`
              : ""}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <AnalystMetric
              label="Nodes"
              value={metrics.nodeCount}
            />
            <AnalystMetric
              label="Edges"
              value={metrics.edgeCount}
            />
            <AnalystMetric
              label="Health"
              value={analysis.score}
            />
            <AnalystMetric
              label="Market"
              value={marketPortfolio.marketHealth}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/graph"
              className="global-analyst-link"
            >
              <Network size={14} />
              Knowledge Graph
            </Link>
            <Link
              href="/market"
              className="global-analyst-link"
            >
              <Landmark size={14} />
              Market
            </Link>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function AnalystMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="global-analyst-metric">
      <p>{value}</p>
      <span>{label}</span>
    </div>
  );
}
