"use client";

import { Crown, Minus, Trophy } from "lucide-react";

import { FragranceAsset } from "@/components/assets/fragrance-asset";
import { NeuralConfidenceCore } from "@/components/intelligence/neural-confidence-core";
import type { DecisionComparisonOutput } from "@/lib/intelligence/decision-comparison-engine";

export function DecisionComparisonView({
  comparison,
}: {
  comparison: DecisionComparisonOutput;
}) {
  const firstWins =
    comparison.winner.candidate.id === comparison.first.candidate.id;
  const secondWins =
    comparison.winner.candidate.id === comparison.second.candidate.id;

  return (
    <div className="decision-comparison-experience">
      <section className="comparison-winner-hero rounded-[34px] border border-[rgba(232,200,127,.25)] p-7 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[.62rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
              OLFACTUS comparison verdict
            </p>
            <h2 className="display-serif mt-3 text-5xl">
              One clear recommendation.
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Trophy size={22} className="text-[var(--gold-bright)]" />
            <span className="comparison-model-chip">
              {comparison.modelVersion}
            </span>
          </div>
        </div>

        <div className="mt-9 grid gap-6 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
          <CandidateStage
            decision={comparison.first}
            winner={firstWins}
          />

          <div className="comparison-vs">
            <span>VS</span>
          </div>

          <CandidateStage
            decision={comparison.second}
            winner={secondWins}
          />
        </div>

        <div className="mt-9 rounded-[26px] border border-[var(--border)] bg-black/10 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-4xl">
              <p className="text-[.6rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
                Winner
              </p>
              <p className="display-serif mt-3 text-4xl text-[var(--gold-bright)]">
                {comparison.winner.candidate.name}
              </p>
              <p className="mt-5 text-base leading-8 text-[var(--muted)]">
                {comparison.analystVerdict}
              </p>
            </div>

            <NeuralConfidenceCore
              value={comparison.confidence}
              label="Comparison confidence"
              size="medium"
            />
          </div>
        </div>
      </section>

      <section className="mt-8 comparison-matrix rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
        <div className="grid grid-cols-[1fr_82px_1fr] items-end gap-4 border-b border-[var(--border)] pb-5">
          <p className="display-serif text-2xl">
            {comparison.first.candidate.name}
          </p>
          <p className="text-center text-[.58rem] font-bold uppercase tracking-[.15em] text-[var(--muted)]">
            Metric
          </p>
          <p className="display-serif text-right text-2xl">
            {comparison.second.candidate.name}
          </p>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {comparison.categories.map((category) => (
            <ComparisonMetricRow
              key={category.id}
              firstName={comparison.first.candidate.id}
              secondName={comparison.second.candidate.id}
              category={category}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <AdvantagePanel
          title={`Why ${comparison.winner.candidate.name} wins`}
          reasons={comparison.winnerReasons}
          winner
        />
        <AdvantagePanel
          title={`Where ${comparison.runnerUp.candidate.name} still leads`}
          reasons={comparison.runnerUpAdvantages}
        />
      </section>
    </div>
  );
}

function CandidateStage({
  decision,
  winner,
}: {
  decision: DecisionComparisonOutput["first"];
  winner: boolean;
}) {
  return (
    <article
      className={`comparison-candidate ${
        winner ? "is-winner" : ""
      } rounded-[28px] border border-[var(--border)] p-5 sm:p-7`}
    >
      <div className="relative h-[330px] overflow-hidden rounded-[24px] border border-[var(--border)] bg-black/10">
        <FragranceAsset
          fragranceId={decision.candidate.id}
          brand={decision.candidate.brand}
          name={decision.candidate.name}
          mode="hero"
          showStatus
          className="h-full"
        />
        {winner ? (
          <span className="comparison-winner-chip">
            <Crown size={13} />
            Winner
          </span>
        ) : null}
      </div>

      <p className="mt-6 text-[.58rem] font-bold uppercase tracking-[.17em] text-[var(--gold)]">
        {decision.candidate.brand}
      </p>
      <h3 className="display-serif mt-2 text-4xl">
        {decision.candidate.name}
      </h3>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Metric label="Score" value={decision.score} />
        <Metric label="Confidence" value={decision.confidence} />
        <Metric
          label="Regret Risk"
          value={decision.metrics.regretRisk}
        />
      </div>
    </article>
  );
}

function ComparisonMetricRow({
  category,
  firstName,
  secondName,
}: {
  category: DecisionComparisonOutput["categories"][number];
  firstName: string;
  secondName: string;
}) {
  const firstWins = category.winnerId === firstName;
  const secondWins = category.winnerId === secondName;

  return (
    <div className="grid grid-cols-[1fr_82px_1fr] items-center gap-4 py-5">
      <div className="flex items-center gap-3">
        <p
          className={`display-serif text-3xl ${
            firstWins ? "text-[var(--gold-bright)]" : ""
          }`}
        >
          {category.firstValue}
        </p>
        {firstWins ? <Trophy size={14} className="text-[var(--gold)]" /> : null}
      </div>

      <div className="text-center">
        <p className="text-[.56rem] font-bold uppercase tracking-[.12em] text-[var(--muted)]">
          {category.label}
        </p>
        {category.winnerId === null ? (
          <Minus size={14} className="mx-auto mt-2 text-[var(--muted)]" />
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3">
        {secondWins ? <Trophy size={14} className="text-[var(--gold)]" /> : null}
        <p
          className={`display-serif text-3xl ${
            secondWins ? "text-[var(--gold-bright)]" : ""
          }`}
        >
          {category.secondValue}
        </p>
      </div>
    </div>
  );
}

function AdvantagePanel({
  title,
  reasons,
  winner = false,
}: {
  title: string;
  reasons: string[];
  winner?: boolean;
}) {
  return (
    <article
      className={`comparison-advantage-panel ${
        winner ? "is-winner" : ""
      } rounded-[30px] border p-7 sm:p-9`}
    >
      <p className="text-[.62rem] font-bold uppercase tracking-[.19em] text-[var(--gold)]">
        {title}
      </p>

      <div className="mt-6 divide-y divide-[var(--border)]">
        {reasons.length ? (
          reasons.map((reason) => (
            <div key={reason} className="py-4 text-sm leading-6 text-[var(--muted)]">
              {reason}
            </div>
          ))
        ) : (
          <p className="py-4 text-sm leading-6 text-[var(--muted)]">
            No decisive category advantage.
          </p>
        )}
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/[.025] p-3 text-center">
      <p className="display-serif text-2xl text-[var(--gold-bright)]">
        {value}
      </p>
      <p className="mt-1 text-[.48rem] font-bold uppercase tracking-[.11em] text-[var(--muted)]">
        {label}
      </p>
    </div>
  );
}
