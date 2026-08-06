"use client";

import {
  Activity,
  BadgeCheck,
  BrainCircuit,
  CircleDollarSign,
  Clock3,
  Gauge,
  Target,
  TrendingUp,
} from "lucide-react";

import type {
  PredictionAccuracyOutput,
} from "@/lib/intelligence/prediction-accuracy-engine";

export function PredictionAccuracyPanel({
  analysis,
}: {
  analysis: PredictionAccuracyOutput;
}) {
  return (
    <section className="prediction-accuracy-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
            Purchase Prediction Accuracy
          </p>
          <h2 className="display-serif mt-3 text-5xl">
            OLFACTUS measures its own judgment.
          </h2>
        </div>
        <span className="prediction-model-chip">
          {analysis.modelVersion}
        </span>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <article className="prediction-score-hero">
          <div className="prediction-score-orbit">
            <div className="prediction-score-center">
              <p className="display-serif text-7xl text-[var(--gold-bright)]">
                {analysis.overallAccuracy}
              </p>
              <p className="mt-2 text-[.56rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
                Overall Accuracy
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <MiniMetric
              label="Matured"
              value={analysis.maturedPredictions}
            />
            <MiniMetric
              label="Pending"
              value={analysis.pendingPredictions}
            />
            <MiniMetric
              label="Verified"
              value={analysis.verifiedPredictions}
            />
          </div>
        </article>

        <article>
          <div className="grid gap-4 sm:grid-cols-2">
            <AccuracyMetric
              icon={<BadgeCheck size={16} />}
              label="Decision Accuracy"
              value={analysis.decisionAccuracy}
            />
            <AccuracyMetric
              icon={<Gauge size={16} />}
              label="Blind-Buy Risk"
              value={analysis.blindBuyRiskAccuracy}
            />
            <AccuracyMetric
              icon={<TrendingUp size={16} />}
              label="Health Impact"
              value={analysis.healthImpactAccuracy}
            />
            <AccuracyMetric
              icon={<CircleDollarSign size={16} />}
              label="Long-Term Value"
              value={analysis.valueAccuracy}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InsightCard
              label="Strongest Category"
              value={analysis.strongestCategory}
              icon={<Target size={17} />}
            />
            <InsightCard
              label="Needs Calibration"
              value={analysis.weakestCategory}
              icon={<BrainCircuit size={17} />}
            />
          </div>
        </article>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <article className="prediction-subpanel rounded-[27px] border border-[var(--border)] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Activity
              size={18}
              className="text-[var(--gold-bright)]"
            />
            <p className="text-[.6rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
              Prediction Outcomes
            </p>
          </div>

          <div className="mt-6 divide-y divide-[var(--border)]">
            {analysis.outcomes.length ? (
              analysis.outcomes.map(
                ({ prediction, outcome }) => (
                  <div
                    key={prediction.id}
                    className="py-5 first:pt-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-[var(--gold)]">
                          {prediction.brand}
                        </p>
                        <h3 className="display-serif mt-1 text-3xl">
                          {prediction.fragranceName}
                        </h3>
                      </div>
                      <span className="prediction-maturity-chip">
                        {formatMaturity(
                          prediction.maturity,
                        )}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <OutcomeMetric
                        label="Accuracy"
                        value={outcome.overallAccuracy}
                      />
                      <OutcomeMetric
                        label="Wears"
                        value={outcome.wearsSincePurchase}
                      />
                      <OutcomeMetric
                        label="Satisfaction"
                        value={outcome.satisfactionScore}
                      />
                      <OutcomeMetric
                        label="Health Gain"
                        value={outcome.actualHealthGain}
                        signed
                      />
                    </div>

                    {outcome.costPerWear != null ? (
                      <p className="mt-4 text-sm text-[var(--muted)]">
                        Current cost per wear:{" "}
                        <span className="text-[var(--gold-bright)]">
                          ${outcome.costPerWear.toFixed(2)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                ),
              )
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                No purchase predictions are available yet. Save a Decision Lab result and confirm the purchase to begin measuring accuracy.
              </p>
            )}
          </div>
        </article>

        <article className="prediction-subpanel rounded-[27px] border border-[var(--border)] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Clock3
              size={18}
              className="text-[var(--gold-bright)]"
            />
            <p className="text-[.6rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
              Calibration Insights
            </p>
          </div>

          <div className="mt-6 divide-y divide-[var(--border)]">
            {analysis.calibrationInsights.map(
              (insight, index) => (
                <div
                  key={`${index}-${insight}`}
                  className="flex gap-4 py-5 first:pt-0"
                >
                  <span className="display-serif text-2xl text-[var(--gold)]">
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>
                  <p className="text-sm leading-7 text-[var(--muted)]">
                    {insight}
                  </p>
                </div>
              ),
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function AccuracyMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="prediction-metric-card">
      <div className="flex items-center gap-2 text-[var(--gold)]">
        {icon}
        <p className="text-[.52rem] font-bold uppercase tracking-[.12em]">
          {label}
        </p>
      </div>
      <p className="display-serif mt-4 text-4xl text-[var(--gold-bright)]">
        {value}
      </p>
      <div className="prediction-progress mt-4">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MiniMetric({
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
      <p className="mt-1 text-[.47rem] font-bold uppercase tracking-[.1em] text-[var(--muted)]">
        {label}
      </p>
    </div>
  );
}

function InsightCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="prediction-insight-card">
      <div className="flex items-center gap-2 text-[var(--gold)]">
        {icon}
        <p className="text-[.52rem] font-bold uppercase tracking-[.12em]">
          {label}
        </p>
      </div>
      <p className="display-serif mt-4 text-3xl">
        {value}
      </p>
    </div>
  );
}

function OutcomeMetric({
  label,
  value,
  signed = false,
}: {
  label: string;
  value: number;
  signed?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/[.02] p-3">
      <p className="text-[.48rem] font-bold uppercase tracking-[.1em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-2xl text-[var(--gold-bright)]">
        {signed && value >= 0 ? "+" : ""}
        {value}
      </p>
    </div>
  );
}

function formatMaturity(
  value:
    | "pending"
    | "early-signal"
    | "matured"
    | "verified"
    | "insufficient-data",
) {
  return {
    pending: "Pending",
    "early-signal": "Early Signal",
    matured: "Matured",
    verified: "Verified",
    "insufficient-data": "Insufficient Data",
  }[value];
}
