"use client";

import { useEffect, useState } from "react";

import type {
  NeuralCoreOutput,
  NeuralCoreStatus,
} from "@/lib/intelligence/intelligence-engine";

interface IntelligenceStatusProps {
  intelligence: NeuralCoreOutput;
}

const statusLabels: Record<NeuralCoreStatus, string> = {
  analyzing: "Analyzing collection",
  current: "Intelligence current",
  limited: "Limited intelligence",
};

export function IntelligenceStatus({
  intelligence,
}: IntelligenceStatusProps) {
  const [displayTime, setDisplayTime] = useState("");

  useEffect(() => {
    const generatedAt = new Date(intelligence.generatedAt);

    setDisplayTime(
      generatedAt.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    );
  }, [intelligence.generatedAt]);

  const complete = intelligence.systemStatus === "current";

  return (
    <section className="mb-6 grid gap-5 rounded-2xl border border-[rgba(200,168,102,0.22)] bg-[linear-gradient(180deg,rgba(23,27,33,0.96),rgba(13,16,20,0.97))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.16)] lg:grid-cols-[minmax(230px,0.9fr)_minmax(260px,1.2fr)_auto] lg:items-center lg:gap-7">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            complete
              ? "bg-[var(--success)] shadow-[0_0_14px_rgba(66,196,122,0.52)]"
              : "animate-pulse bg-[var(--gold)]"
          }`}
        />

        <div>
          <p className="m-0 text-[0.68rem] font-bold tracking-[0.15em] text-[var(--gold)]">
            NEURAL CORE
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
            {statusLabels[intelligence.systemStatus]}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-[var(--muted)]">
            Analysis confidence
          </span>

          <strong className="text-sm text-[var(--foreground)]">
            {intelligence.confidence}%
          </strong>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.065]">
          <span
            className="block h-full rounded-full bg-[linear-gradient(90deg,var(--gold),#ead298)] transition-[width] duration-500 ease-out"
            style={{ width: `${intelligence.confidence}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-[var(--muted)]">
          {displayTime
            ? `Analysis generated at ${displayTime}`
            : "Preparing analysis timestamp"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        {intelligence.activeSources.map((source) => (
          <span
            key={source}
            className="rounded-full border border-[var(--border)] bg-white/[0.025] px-2.5 py-1.5 text-[0.7rem] text-[var(--muted)]"
          >
            {source}
          </span>
        ))}
      </div>
    </section>
  );
}