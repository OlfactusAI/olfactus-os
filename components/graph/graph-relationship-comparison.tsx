"use client";

import {
  ArrowRightLeft,
  CheckCircle2,
  Dna,
  Gauge,
  Sparkles,
} from "lucide-react";

import type {
  KnowledgeGraph,
  KnowledgeGraphNode,
} from "@/lib/graph/types";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  scoreFragranceRelationship,
} from "@/lib/intelligence/knowledge-graph-engine";

export function GraphRelationshipComparison({
  graph,
  firstNode,
  secondNode,
  catalog,
  onClear,
}: {
  graph: KnowledgeGraph;
  firstNode: KnowledgeGraphNode | null;
  secondNode: KnowledgeGraphNode | null;
  catalog: FragranceRecord[];
  onClear: () => void;
}) {
  if (
    !firstNode ||
    !secondNode ||
    firstNode.type !== "fragrance" ||
    secondNode.type !== "fragrance"
  ) {
    return (
      <section className="graph-comparison-panel graph-panel">
        <div className="flex items-center gap-3">
          <ArrowRightLeft
            size={18}
            className="text-[var(--gold)]"
          />
          <p className="text-[.61rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
            Relationship Comparison
          </p>
        </div>
        <p className="display-serif mt-6 text-4xl">
          Compare two fragrances.
        </p>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Select one fragrance normally, then
          double-click a second fragrance node to
          open a relationship analysis.
        </p>
      </section>
    );
  }

  const first = catalog.find(
    (item) =>
      item.id === firstNode.fragranceId,
  );
  const second = catalog.find(
    (item) =>
      item.id === secondNode.fragranceId,
  );

  if (!first || !second) return null;

  const score =
    scoreFragranceRelationship(
      first,
      second,
    );

  const sharedDna = Object.entries(
    first.dna,
  )
    .filter(
      ([dimension, value]) =>
        value >= 65 &&
        second.dna[
          dimension as keyof typeof second.dna
        ] >= 65,
    )
    .map(([dimension]) => dimension)
    .slice(0, 4);

  const verdict =
    score.overall >= 82
      ? "Very high overlap"
      : score.overall >= 68
        ? "Strongly related, still distinct"
        : score.overall >= 52
          ? "Complementary relationship"
          : "Distant relationship";

  return (
    <section className="graph-comparison-panel graph-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <ArrowRightLeft
            size={18}
            className="text-[var(--gold)]"
          />
          <p className="text-[.61rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
            Relationship Comparison
          </p>
        </div>
        <button
          type="button"
          className="graph-clear-comparison"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <ComparisonIdentity
          brand={first.brand}
          name={first.name}
        />
        <div className="graph-comparison-score">
          <p className="display-serif text-5xl text-[var(--gold-bright)]">
            {score.overall}
          </p>
          <p className="mt-1 text-[.48rem] font-bold uppercase tracking-[.1em] text-[var(--muted)]">
            Relationship
          </p>
        </div>
        <ComparisonIdentity
          brand={second.brand}
          name={second.name}
          alignRight
        />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <Metric
          icon={<Dna size={15} />}
          label="DNA Similarity"
          value={score.dnaSimilarity}
        />
        <Metric
          icon={<Sparkles size={15} />}
          label="Role Similarity"
          value={score.roleSimilarity}
        />
        <Metric
          icon={<Gauge size={15} />}
          label="Seasonal Similarity"
          value={score.seasonalSimilarity}
        />
        <Metric
          icon={<CheckCircle2 size={15} />}
          label="Performance Similarity"
          value={score.performanceSimilarity}
        />
      </div>

      <div className="mt-7 rounded-[22px] border border-[var(--border)] bg-black/10 p-5">
        <p className="text-[.55rem] font-bold uppercase tracking-[.14em] text-[var(--gold)]">
          Verdict
        </p>
        <p className="display-serif mt-3 text-3xl">
          {verdict}
        </p>
        <p className="mt-4 text-sm capitalize text-[var(--muted)]">
          Shared strengths:{" "}
          {sharedDna.length
            ? sharedDna.join(" · ")
            : "No dominant DNA dimensions"}
        </p>
      </div>
    </section>
  );
}

function ComparisonIdentity({
  brand,
  name,
  alignRight = false,
}: {
  brand: string;
  name: string;
  alignRight?: boolean;
}) {
  return (
    <div
      className={
        alignRight
          ? "sm:text-right"
          : ""
      }
    >
      <p className="text-xs text-[var(--gold)]">
        {brand}
      </p>
      <p className="display-serif mt-2 text-3xl">
        {name}
      </p>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="graph-comparison-metric">
      <div className="flex items-center gap-2 text-[var(--gold)]">
        {icon}
        <p className="text-[.48rem] font-bold uppercase tracking-[.1em]">
          {label}
        </p>
      </div>
      <p className="display-serif mt-3 text-3xl text-[var(--gold-bright)]">
        {value}
      </p>
    </div>
  );
}
