"use client";

import type { NeuralCoreOutput } from "@/lib/intelligence/intelligence-engine";

interface NeuralHeaderProps {
  intelligence: NeuralCoreOutput;
}

const statusText = {
  analyzing: "Analyzing",
  current: "All systems operational",
  limited: "Limited intelligence",
} as const;

export function NeuralHeader({
  intelligence,
}: NeuralHeaderProps) {
  const updatedAt = new Date(
    intelligence.generatedAt,
  ).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[rgba(200,168,102,.22)] bg-[linear-gradient(145deg,rgba(26,30,37,.98),rgba(9,11,14,.98))] p-6 shadow-[0_28px_80px_rgba(0,0,0,.28)] sm:p-8">
      <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(200,168,102,.17),transparent_66%)]" />

      <div className="relative grid gap-7 xl:grid-cols-[1.15fr_.65fr_1fr] xl:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                intelligence.systemStatus === "current"
                  ? "bg-[var(--success)] shadow-[0_0_16px_rgba(66,196,122,.58)]"
                  : "animate-pulse bg-[var(--gold)]"
              }`}
            />
            <p className="text-[.68rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
              OLFACTUS Neural Core
            </p>
          </div>

          <h2 className="display-serif mt-4 text-4xl leading-tight sm:text-5xl">
            Neural Intelligence Briefing
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--muted)]">
            Your recommendation, rotation, collection health, and strategic
            opportunities have been synthesized into one live briefing.
          </p>
        </div>

        <div className="border-y border-[var(--border)] py-6 xl:border-x xl:border-y-0 xl:px-8 xl:py-2">
          <p className="text-[.65rem] font-bold uppercase tracking-[.16em] text-[var(--muted)]">
            Neural confidence
          </p>

          <div className="mt-2 flex items-end gap-2">
            <p className="display-serif text-6xl leading-none text-[var(--gold)]">
              {intelligence.confidence}
            </p>
            <span className="mb-1 text-xl text-[var(--gold)]">%</span>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
            <span
              className="block h-full rounded-full bg-[linear-gradient(90deg,var(--gold),#ead49d)]"
              style={{ width: `${intelligence.confidence}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-[var(--muted)]">
            Updated {updatedAt}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-[.65rem] font-bold uppercase tracking-[.16em] text-[var(--muted)]">
              System status
            </p>
            <span className="rounded-full border border-[rgba(66,196,122,.22)] bg-[rgba(66,196,122,.07)] px-3 py-1 text-[.68rem] font-semibold text-[var(--success)]">
              {statusText[intelligence.systemStatus]}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {intelligence.activeSources.map((source) => (
              <span
                key={source}
                className="rounded-full border border-[var(--border)] bg-white/[.025] px-3 py-1.5 text-[.7rem] text-[var(--muted)]"
              >
                {source}
              </span>
            ))}
          </div>

          <p className="mt-4 text-xs text-[var(--muted)]">
            {intelligence.activeSources.length} intelligence systems connected
          </p>
        </div>
      </div>
    </section>
  );
}
