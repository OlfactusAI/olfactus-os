"use client";

import { Check, Cpu } from "lucide-react";
import type { NeuralPipelineStage } from "@/lib/intelligence/discovery-engine";

export function NeuralActivityFeed({
  stages,
}: {
  stages: NeuralPipelineStage[];
}) {
  return (
    <section className="neural-activity-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
      <div className="flex items-center gap-3">
        <Cpu size={17} className="text-[var(--gold-bright)]" />
        <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
          Neural activity
        </p>
      </div>

      <div className="mt-7 divide-y divide-[var(--border)]">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="neural-stage flex items-center justify-between gap-4 py-4"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="neural-stage-check">
                <Check size={11} />
              </span>
              <div>
                <p className="text-sm font-semibold">{stage.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Analysis complete
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--success)]">
              {stage.confidence}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
