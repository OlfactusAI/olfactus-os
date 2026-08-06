"use client";

import {
  Compass,
  GitBranch,
  Lightbulb,
  Radar,
  Sparkles,
} from "lucide-react";

import type {
  GraphIntelligenceOutput,
} from "@/lib/intelligence/graph-intelligence-engine";

const icons = {
  cluster: Radar,
  bridge: GitBranch,
  isolation: Compass,
  redundancy: Sparkles,
  expansion: Lightbulb,
  preference: Lightbulb,
};

export function GraphIntelligenceBriefing({
  analysis,
  onSelectNode,
}: {
  analysis: GraphIntelligenceOutput;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <section className="graph-intelligence-briefing graph-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
            Graph Intelligence
          </p>
          <h2 className="display-serif mt-3 text-5xl">
            What the network reveals.
          </h2>
        </div>
        <span className="graph-intelligence-model">
          {analysis.modelVersion}
        </span>
      </div>

      <blockquote className="display-serif mt-7 max-w-5xl text-2xl leading-[1.4] sm:text-3xl">
        “{analysis.briefing}”
      </blockquote>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {analysis.insights.map((insight) => {
          const Icon =
            icons[insight.category];

          const content = (
            <>
              <div className="flex items-center justify-between gap-4">
                <Icon
                  size={17}
                  className="text-[var(--gold)]"
                />
                <span className="text-sm text-[var(--gold-bright)]">
                  {insight.score}
                </span>
              </div>
              <p className="display-serif mt-5 text-3xl">
                {insight.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {insight.explanation}
              </p>
            </>
          );

          return insight.nodeId ? (
            <button
              key={insight.id}
              type="button"
              className="graph-insight-card text-left"
              onClick={() =>
                onSelectNode(
                  insight.nodeId!,
                )
              }
            >
              {content}
            </button>
          ) : (
            <article
              key={insight.id}
              className="graph-insight-card"
            >
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
