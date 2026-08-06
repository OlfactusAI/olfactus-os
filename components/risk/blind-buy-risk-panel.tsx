"use client";

import {
  AlertTriangle,
  Check,
  CircleDollarSign,
  Dna,
  Fingerprint,
  Layers3,
  Radar,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { FragranceAsset } from "@/components/assets/fragrance-asset";
import {
  formatRiskTier,
  formatVerdict,
  type BlindBuyRiskOutput,
} from "@/lib/intelligence/blind-buy-risk-engine";

export function BlindBuyRiskPanel({
  analysis,
}: {
  analysis: BlindBuyRiskOutput;
}) {
  return (
    <section className="blind-risk-panel rounded-[34px] border border-[rgba(232,200,127,.23)] p-7 sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[.63rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
            Blind Buy Risk Intelligence
          </p>
          <h2 className="display-serif mt-3 text-5xl">
            Know the risk before the bottle.
          </h2>
        </div>
        <span className="blind-risk-model">
          {analysis.modelVersion}
        </span>
      </div>

      <div className="mt-9 grid gap-8 xl:grid-cols-[.8fr_1.2fr] xl:items-center">
        <div className="blind-risk-visual">
          <div
            className="blind-risk-gauge"
            style={{
              "--risk-progress": `${analysis.riskScore * 3.6}deg`,
            } as React.CSSProperties}
          >
            <div className="blind-risk-gauge-center">
              <p className="display-serif text-7xl text-[var(--gold-bright)]">
                {analysis.riskScore}
              </p>
              <p className="mt-2 text-[.57rem] font-bold uppercase tracking-[.15em] text-[var(--muted)]">
                Risk / 100
              </p>
            </div>
          </div>
          <p className="mt-5 text-center text-sm font-semibold uppercase tracking-[.18em] text-[var(--gold-bright)]">
            {formatRiskTier(analysis.riskTier)}
          </p>
        </div>

        <div>
          <div className="blind-risk-verdict">
            <p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
              Purchase verdict
            </p>
            <p className="display-serif mt-3 text-6xl text-[var(--gold-bright)]">
              {formatVerdict(analysis.verdict)}
            </p>
          </div>

          <p className="mt-6 text-base leading-8 text-[var(--muted)]">
            {analysis.summary}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <RiskMetric
              label="Compatibility"
              value={analysis.compatibility}
            />
            <RiskMetric
              label="New DNA"
              value={analysis.newDna}
            />
            <RiskMetric
              label="Novelty"
              value={analysis.novelty}
            />
            <RiskMetric
              label="Confidence"
              value={analysis.personalConfidence}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ReasonColumn
          title="Lowers risk"
          icon={<Check size={17} />}
          reasons={analysis.reasonsLoweringRisk}
          positive
        />
        <ReasonColumn
          title="Raises risk"
          icon={<AlertTriangle size={17} />}
          reasons={analysis.reasonsRaisingRisk}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.12fr_.88fr]">
        <article className="blind-risk-subpanel rounded-[28px] border border-[var(--border)] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.61rem] font-bold uppercase tracking-[.19em] text-[var(--gold)]">
                Similar bottles already owned
              </p>
              <h3 className="display-serif mt-3 text-4xl">
                Where overlap actually exists.
              </h3>
            </div>
            <Layers3
              size={40}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {analysis.similarOwned.length ? (
              analysis.similarOwned.map((item) => (
                <div
                  key={item.fragranceId}
                  className="blind-similarity-card rounded-[22px] border border-[var(--border)] p-4"
                >
                  <div className="grid grid-cols-[72px_1fr] items-center gap-4">
                    <FragranceAsset
                      fragranceId={item.fragranceId}
                      brand={item.brand}
                      name={item.fragranceName}
                      mode="thumbnail"
                      className="h-24"
                    />
                    <div>
                      <p className="text-xs text-[var(--gold)]">
                        {item.brand}
                      </p>
                      <p className="display-serif mt-1 text-2xl">
                        {item.fragranceName}
                      </p>
                      <p className="mt-2 text-sm text-[var(--gold-bright)]">
                        {item.similarity}% similar
                      </p>
                      <p className="mt-2 text-xs capitalize text-[var(--muted)]">
                        {item.sharedDna.join(" · ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No owned bottles are available for similarity analysis.
              </p>
            )}
          </div>
        </article>

        <article className="blind-risk-subpanel rounded-[28px] border border-[var(--border)] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <CircleDollarSign
              size={18}
              className="text-[var(--gold-bright)]"
            />
            <p className="text-[.61rem] font-bold uppercase tracking-[.19em] text-[var(--gold)]">
              Price intelligence
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <RiskMetric
              label="Observed"
              value={analysis.observedPrice}
              prefix="$"
            />
            <RiskMetric
              label="Buy Window"
              value={analysis.recommendedPrice}
              prefix="$"
            />
            <RiskMetric
              label="Price Gap"
              value={analysis.priceGap}
              prefix={analysis.priceGap >= 0 ? "+$" : "-$"}
              absolute
            />
            <RiskMetric
              label="Value"
              value={analysis.priceValue}
            />
          </div>

          <div className="mt-7 border-t border-[var(--border)] pt-6">
            <div className="flex items-center gap-3">
              <Fingerprint
                size={16}
                className="text-[var(--gold)]"
              />
              <p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
                Personal signals used
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {analysis.signalsUsed.map((signal) => (
                <span
                  key={signal}
                  className="blind-signal-chip"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function ReasonColumn({
  title,
  icon,
  reasons,
  positive = false,
}: {
  title: string;
  icon: React.ReactNode;
  reasons: BlindBuyRiskOutput["reasonsLoweringRisk"];
  positive?: boolean;
}) {
  return (
    <article
      className={`blind-reason-column ${
        positive ? "is-positive" : ""
      } rounded-[28px] border p-6 sm:p-8`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <p className="text-[.61rem] font-bold uppercase tracking-[.19em]">
          {title}
        </p>
      </div>

      <div className="mt-6 divide-y divide-[var(--border)]">
        {reasons.map((reason) => (
          <div key={reason.id} className="py-4">
            <div className="flex items-start justify-between gap-4">
              <p className="font-semibold">
                {reason.title}
              </p>
              <p className="text-sm text-[var(--gold-bright)]">
                {reason.impact}
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {reason.explanation}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function RiskMetric({
  label,
  value,
  prefix = "",
  absolute = false,
}: {
  label: string;
  value: number;
  prefix?: string;
  absolute?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/[.025] p-4">
      <p className="text-[.5rem] font-bold uppercase tracking-[.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-3xl text-[var(--gold-bright)]">
        {prefix}
        {absolute ? Math.abs(value) : value}
      </p>
    </div>
  );
}
