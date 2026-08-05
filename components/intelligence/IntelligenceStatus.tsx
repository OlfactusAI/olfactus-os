"use client";

import { useEffect, useState } from "react";

const stages = [
  "Reading collection",
  "Checking rotation",
  "Comparing scent DNA",
  "Evaluating collection gaps",
  "Intelligence current",
];

export function IntelligenceStatus() {
  const [stageIndex, setStageIndex] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStageIndex((current) => {
        if (current >= stages.length - 1) {
          window.clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, 650);

    const completeTimer = window.setTimeout(() => {
      setUpdatedAt(new Date());
    }, 650 * (stages.length - 1));

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(completeTimer);
    };
  }, []);

  const progress = ((stageIndex + 1) / stages.length) * 100;
  const complete = stageIndex === stages.length - 1;

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
            OLFACTUS INTELLIGENCE
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
            {stages[stageIndex]}
          </p>
        </div>
      </div>

      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.065]">
          <span
            className="block h-full rounded-full bg-[linear-gradient(90deg,var(--gold),#ead298)] transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-[var(--muted)]">
          {complete
            ? `Analysis current${
                updatedAt
                  ? ` · ${updatedAt.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}`
                  : ""
              }`
            : `${Math.round(progress)}% complete`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        {["Collection", "Rotation", "DNA", "Health"].map((source) => (
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