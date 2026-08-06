"use client";

import { ArrowRight, TrendingUp } from "lucide-react";
import type { DiscoveryRecommendation } from "@/lib/intelligence/discovery-engine";

export function CollectionImpactSimulator({
  recommendation,
}: {
  recommendation: DiscoveryRecommendation;
}) {
  return (
    <section className="impact-simulator rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
            Collection impact simulator
          </p>
          <h3 className="display-serif mt-3 text-4xl">
            Before and after.
          </h3>
        </div>
        <TrendingUp size={42} strokeWidth={1} className="text-[var(--gold)] opacity-70" />
      </div>

      <div className="mt-8 flex items-center justify-between gap-5 rounded-[24px] border border-[var(--border)] bg-black/10 p-5 sm:p-7">
        <div>
          <p className="text-xs text-[var(--muted)]">Current health</p>
          <p className="display-serif mt-2 text-6xl">
            {recommendation.projectedHealth - recommendation.projectedHealthGain}
          </p>
        </div>
        <ArrowRight className="text-[var(--gold)]" />
        <div className="text-right">
          <p className="text-xs text-[var(--muted)]">Projected health</p>
          <p className="display-serif mt-2 text-6xl text-[var(--gold-bright)]">
            {recommendation.projectedHealth}
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-5">
        {recommendation.impactDimensions.map((dimension) => (
          <div key={dimension.id}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{dimension.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {dimension.current} → {dimension.projected}
                </p>
              </div>
              <p className={`display-serif text-2xl ${dimension.delta >= 0 ? "text-[var(--gold-bright)]" : "text-[var(--warning)]"}`}>
                {dimension.delta >= 0 ? "+" : ""}
                {dimension.delta}
              </p>
            </div>
            <div className="impact-track mt-3">
              <span style={{ width: `${dimension.projected}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
