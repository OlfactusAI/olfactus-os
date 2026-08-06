"use client";

import {
  ArrowRight,
  CircleDot,
  Network,
  Orbit,
  Sparkles,
} from "lucide-react";

import type {
  KnowledgeGraph,
  KnowledgeGraphNode,
} from "@/lib/graph/types";
import {
  getNeighbors,
} from "@/lib/intelligence/knowledge-graph-engine";

export function GraphNodeInspector({
  graph,
  node,
  onSelectNode,
}: {
  graph: KnowledgeGraph;
  node: KnowledgeGraphNode | null;
  onSelectNode: (nodeId: string) => void;
}) {
  if (!node) {
    return (
      <aside className="graph-inspector graph-panel">
        <div className="flex items-center gap-3">
          <CircleDot
            size={18}
            className="text-[var(--gold)]"
          />
          <p className="text-[.61rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
            Node Inspector
          </p>
        </div>
        <p className="display-serif mt-6 text-4xl">
          Select a node.
        </p>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Explore its strongest relationships,
          strategic role, and connected graph
          neighborhood.
        </p>
      </aside>
    );
  }

  const neighbors = getNeighbors(
    graph,
    node.id,
    0,
  ).slice(0, 8);

  return (
    <aside className="graph-inspector graph-panel">
      <div className="flex items-center justify-between gap-4">
        <span className="graph-node-type-chip">
          {node.type}
        </span>
        <Network
          size={19}
          className="text-[var(--gold)]"
        />
      </div>

      <p className="mt-6 text-xs text-[var(--gold)]">
        {node.subtitle}
      </p>
      <h2 className="display-serif mt-2 text-5xl">
        {node.label}
      </h2>

      {node.type === "fragrance" ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <InspectorMetric
            label="Status"
            value={
              node.owned
                ? "Owned"
                : "Candidate"
            }
          />
          <InspectorMetric
            label="Connections"
            value={String(neighbors.length)}
          />
          <InspectorMetric
            label="Family"
            value={node.family ?? "—"}
          />
          <InspectorMetric
            label="Confidence"
            value={`${node.score ?? 0}%`}
          />
        </div>
      ) : null}

      <div className="mt-7 border-t border-[var(--border)] pt-6">
        <div className="flex items-center gap-3">
          <Orbit
            size={16}
            className="text-[var(--gold)]"
          />
          <p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
            Strongest Relationships
          </p>
        </div>

        <div className="mt-4 divide-y divide-[var(--border)]">
          {neighbors.map(({ node: related, edge }) => (
            <button
              key={edge.id}
              type="button"
              className="graph-relationship-row"
              onClick={() =>
                onSelectNode(related.id)
              }
            >
              <div className="min-w-0 text-left">
                <p className="truncate font-semibold">
                  {related.label}
                </p>
                <p className="mt-1 text-xs capitalize text-[var(--muted)]">
                  {edge.type.replaceAll("-", " ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--gold-bright)]">
                  {edge.strength}
                </span>
                <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {neighbors[0] ? (
        <div className="mt-7 rounded-[22px] border border-[var(--border)] bg-black/10 p-5">
          <div className="flex items-center gap-3">
            <Sparkles
              size={15}
              className="text-[var(--gold)]"
            />
            <p className="text-[.55rem] font-bold uppercase tracking-[.14em] text-[var(--gold)]">
              Relationship Insight
            </p>
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {neighbors[0].edge.explanation}
          </p>
        </div>
      ) : null}
    </aside>
  );
}

function InspectorMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/[.02] p-4">
      <p className="text-[.48rem] font-bold uppercase tracking-[.1em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-2xl text-[var(--gold-bright)]">
        {value}
      </p>
    </div>
  );
}
