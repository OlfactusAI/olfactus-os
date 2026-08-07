"use client";

import {
  useState,
} from "react";

import {
  aventusReferenceResearchPack,
} from "@/lib/gold-standard-builder/research-packs";
import {
  saveResearchPack,
} from "@/lib/gold-standard-builder/research-packs/storage";

export function AventusResearchPack() {
  const [
    notice,
    setNotice,
  ] =
    useState("");

  const pack =
    aventusReferenceResearchPack;

  const importPack =
    () => {
      saveResearchPack(
        pack,
      );
      setNotice(
        "Aventus research pack imported. It is now available as shared evidence for independent calibration; no scores were populated.",
      );
    };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
          OLFACTUS Reference Research
        </p>
        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Creed Aventus Research Pack
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Shared evidence for Reviewer A and Reviewer B. The pack contains sourced facts, disagreements, performance aggregates, similarity context, and calibration cautions—but deliberately contains no OLFACTUS scores.
            </p>
          </div>

          <button
            type="button"
            onClick={
              importPack
            }
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"
          >
            Import evidence pack
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric
          label="Sources"
          value={
            String(
              pack.sources.length,
            )
          }
        />
        <Metric
          label="Sourced facts"
          value={
            String(
              pack.facts.length,
            )
          }
        />
        <Metric
          label="Calibration sections"
          value={
            String(
              Object.keys(
                pack.sectionEvidence,
              ).length,
            )
          }
        />
        <Metric
          label="Scores included"
          value={
            pack.policy
              .scoresIncluded
              ? "YES"
              : "NO"
          }
        />
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <h2 className="text-xl font-semibold text-white">
          Research findings
        </h2>

        <div className="mt-5 space-y-3">
          {pack.facts.map(
            (fact) => (
              <article
                key={
                  fact.factId
                }
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                      {fact.category}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {fact.claim}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs font-semibold text-white/45">
                    {fact.confidence}% source confidence
                  </span>
                </div>

                <p className="mt-3 text-xs text-white/30">
                  Sources: {fact.sourceIds.join(", ")}
                </p>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
          <h2 className="text-xl font-semibold text-white">
            Sources
          </h2>
          <div className="mt-5 space-y-3">
            {pack.sources.map(
              (source) => (
                <div
                  key={
                    source.sourceId
                  }
                  className="rounded-xl border border-white/10 p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {source.publisher}
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    {source.sourceType} · {source.weight}
                  </p>
                  <p className="mt-2 break-all text-xs text-white/45">
                    {source.url}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
          <h2 className="text-xl font-semibold text-white">
            Reviewer cautions
          </h2>
          <div className="mt-5 space-y-3">
            {pack.reviewerCautions.map(
              (caution) => (
                <div
                  key={
                    caution
                  }
                  className="rounded-xl border border-white/10 p-4 text-sm leading-6 text-white/60"
                >
                  {caution}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-2xl font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/35">
        {label}
      </p>
    </div>
  );
}
