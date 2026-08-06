"use client";

import Link from "next/link";

import {
  Activity,
  BarChart3,
  CircleDollarSign,
  Landmark,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useCollection } from "@/components/providers/collection-provider";
import { analyzeCollectionValueDashboard } from "@/lib/intelligence/collection-value-dashboard";
import { fragrances } from "@/lib/data/fragrances";

export default function MarketPage() {
  const {
    items,
    hydrated,
  } = useCollection();
  const [allocationMode, setAllocationMode] =
    useState<"brand" | "family">(
      "brand",
    );

  const portfolio = useMemo(
    () =>
      analyzeCollectionValueDashboard({
        collection: items,
        catalog: fragrances,
      }),
    [items],
  );

  const allocation =
    allocationMode === "brand"
      ? portfolio.byBrand
      : portfolio.byFamily;

  return (
    <div className="market-page pb-12">
      <section className="market-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="market-grid pointer-events-none absolute inset-0" />
        <div className="market-aura pointer-events-none absolute -right-48 -top-52 h-[780px] w-[780px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="market-command-mark">
              <Landmark size={18} />
            </span>
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.24em] text-[var(--gold-bright)]">
                OLFACTUS Market Intelligence
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Collection portfolio analysis · {portfolio.modelVersion}
              </p>
            </div>
          </div>
          <span className="market-status-chip">
            Portfolio synchronized
          </span>
        </div>

        <div className="relative mt-10 grid gap-10 xl:grid-cols-[1.08fr_.92fr] xl:items-end">
          <div>
            <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
              Estimated Portfolio
            </p>
            <h1 className="display-serif mt-5 text-[clamp(4.7rem,9vw,9rem)] leading-[.82] tracking-[-.065em] text-[var(--gold-bright)]">
              ${portfolio.estimatedMarketValue.toLocaleString()}
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Current estimated market value across {portfolio.holdings.length} tracked holdings, with a retail replacement cost of ${portfolio.retailReplacementValue.toLocaleString()}.
            </p>
            <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
              Market values are calibrated OLFACTUS reference estimates and are not live retailer quotes.
            </p>
          </div>

          <div className="market-grade-card">
            <p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
              Portfolio Grade
            </p>
            <p className="display-serif mt-3 text-[7rem] leading-none text-[var(--gold-bright)]">
              {portfolio.portfolioGrade}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniMetric
                label="Market Health"
                value={portfolio.marketHealth}
              />
              <MiniMetric
                label="Confidence"
                value={portfolio.confidence}
              />
            </div>
          </div>
        </div>

        <div className="relative mt-9 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label="Retail Replacement"
            value={portfolio.retailReplacementValue}
            currency
          />
          <HeroMetric
            label="Amount Paid"
            value={portfolio.totalAmountPaid}
            currency
          />
          <HeroMetric
            label="Savings Generated"
            value={portfolio.unrealizedSavings}
            currency
            signed
          />
          <HeroMetric
            label="Average Cost / Wear"
            value={portfolio.averageCostPerWear}
            currency
          />
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PortfolioCard
          icon={<CircleDollarSign size={19} />}
          label="Estimated Market Value"
          value={`$${portfolio.estimatedMarketValue.toLocaleString()}`}
          explanation="Estimated replacement value in the current market."
          trend="+3.4%"
        />
        <PortfolioCard
          icon={<WalletCards size={19} />}
          label="Retail Replacement"
          value={`$${portfolio.retailReplacementValue.toLocaleString()}`}
          explanation="Estimated cost to repurchase the active collection at retail."
          trend="+1.8%"
        />
        <PortfolioCard
          icon={<TrendingUp size={19} />}
          label="Projected Value"
          value={`$${portfolio.projectedValue.toLocaleString()}`}
          explanation="Twelve-month projection from stability and replacement pressure."
          trend="+2.1%"
        />
        <PortfolioCard
          icon={<Sparkles size={19} />}
          label="Savings Generated"
          value={`${portfolio.unrealizedSavings >= 0 ? "+" : ""}$${Math.abs(portfolio.unrealizedSavings).toLocaleString()}`}
          explanation="Difference between retail replacement and acquisition cost."
          trend="Efficient"
        />
        <PortfolioCard
          icon={<Activity size={19} />}
          label="Cost per Wear"
          value={`$${portfolio.averageCostPerWear.toFixed(2)}`}
          explanation="Average acquisition cost distributed across recorded wears."
          trend="Portfolio"
        />
        <PortfolioCard
          icon={<ShieldCheck size={19} />}
          label="Market Health"
          value={`${portfolio.marketHealth}/100`}
          explanation="Diversification, stability, usage, concentration, and savings."
          trend={portfolio.portfolioGrade}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <article className="market-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
                Portfolio Allocation
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Where collection value lives.
              </h2>
            </div>
            <div className="market-tabs">
              <button
                type="button"
                className={allocationMode === "brand" ? "is-active" : ""}
                onClick={() => setAllocationMode("brand")}
              >
                By Brand
              </button>
              <button
                type="button"
                className={allocationMode === "family" ? "is-active" : ""}
                onClick={() => setAllocationMode("family")}
              >
                By Family
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {allocation.map((entry) => (
              <div key={entry.label}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-semibold">{entry.label}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {entry.bottleCount} bottle{entry.bottleCount === 1 ? "" : "s"} · ${entry.averageValue.toFixed(0)} average
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="display-serif text-2xl text-[var(--gold-bright)]">
                      ${entry.marketValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {entry.percentage}%
                    </p>
                  </div>
                </div>
                <div className="market-allocation-bar mt-3">
                  <span style={{ width: `${entry.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="market-panel market-analyst rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Sparkles
              size={18}
              className="text-[var(--gold-bright)]"
            />
            <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
              OLFACTUS Market Analyst
            </p>
          </div>
          <blockquote className="display-serif mt-7 text-3xl leading-[1.35]">
            “{portfolio.analystBriefing}”
          </blockquote>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <RiskMetric
              label="Diversification"
              value={portfolio.risk.diversification}
              positive
            />
            <RiskMetric
              label="Stability"
              value={portfolio.risk.stability}
              positive
            />
            <RiskMetric
              label="Concentration"
              value={portfolio.risk.concentration}
            />
            <RiskMetric
              label="Underuse Risk"
              value={portfolio.risk.underuse}
            />
            <RiskMetric
              label="Replacement Risk"
              value={portfolio.risk.replacement}
            />
            <RiskMetric
              label="Market Health"
              value={portfolio.marketHealth}
              positive
            />
          </div>
        </article>
      </section>

      <section className="mt-8 market-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
              Largest Holdings
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              The portfolio's highest-value bottles.
            </h2>
          </div>
          <BarChart3
            size={44}
            strokeWidth={1}
            className="text-[var(--gold)] opacity-70"
          />
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="market-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Fragrance</th>
                <th>Market Value</th>
                <th>Portfolio</th>
                <th>Strategic</th>
                <th>Replacement</th>
                <th>Analyze</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.topHoldings.map((holding, index) => (
                <tr key={holding.fragranceId}>
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td>
                    <strong>{holding.name}</strong>
                    <span>{holding.brand}</span>
                  </td>
                  <td>${holding.marketValue.toLocaleString()}</td>
                  <td>{holding.portfolioShare}%</td>
                  <td>{holding.strategicValue}</td>
                  <td>{holding.replacementDifficulty}</td>
                  <td>
                    <Link
                      href={`/deal-lab?fragrance=${holding.fragranceId}&price=${holding.marketValue}`}
                      className="market-deal-link"
                    >
                      Open Deal Lab
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <HoldingList
          label="Best Purchases"
          title="Highest portfolio efficiency."
          holdings={portfolio.bestPurchases}
          positive
        />
        <HoldingList
          label="Needs Attention"
          title="Where value is being left unused."
          holdings={portfolio.needsAttention}
        />
      </section>

      {!hydrated ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Synchronizing purchase history and wear activity…
        </p>
      ) : null}
    </div>
  );
}

function PortfolioCard({
  icon,
  label,
  value,
  explanation,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  explanation: string;
  trend: string;
}) {
  return (
    <article className="market-card">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[var(--gold)]">{icon}</span>
        <span className="market-trend">{trend}</span>
      </div>
      <p className="mt-6 text-[.58rem] font-bold uppercase tracking-[.15em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-3 text-4xl text-[var(--gold-bright)]">
        {value}
      </p>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {explanation}
      </p>
      <div className="market-sparkline mt-5">
        {[38, 48, 43, 62, 58, 74, 82].map((height, index) => (
          <span key={index} style={{ height: `${height}%` }} />
        ))}
      </div>
    </article>
  );
}

function HeroMetric({
  label,
  value,
  currency = false,
  signed = false,
}: {
  label: string;
  value: number;
  currency?: boolean;
  signed?: boolean;
}) {
  const formatted =
    currency
      ? `$${Math.abs(value).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`
      : value.toLocaleString();

  return (
    <div className="market-hero-metric">
      <p className="text-[.56rem] font-bold uppercase tracking-[.13em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-4xl text-[var(--gold-bright)]">
        {signed && value >= 0 ? "+" : ""}
        {formatted}
      </p>
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
    <div className="rounded-2xl border border-[var(--border)] bg-white/[.025] p-4">
      <p className="text-[.5rem] font-bold uppercase tracking-[.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-3xl text-[var(--gold-bright)]">
        {value}
      </p>
    </div>
  );
}

function RiskMetric({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  const displayValue =
    positive ? value : 100 - value;

  return (
    <div className="market-risk-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[.5rem] font-bold uppercase tracking-[.11em] text-[var(--muted)]">
          {label}
        </p>
        <p className="text-sm text-[var(--gold-bright)]">
          {value}
        </p>
      </div>
      <div className="market-risk-bar mt-3">
        <span style={{ width: `${displayValue}%` }} />
      </div>
    </div>
  );
}

function HoldingList({
  label,
  title,
  holdings,
  positive = false,
}: {
  label: string;
  title: string;
  holdings: ReturnType<
    typeof analyzeCollectionValueDashboard
  >["holdings"];
  positive?: boolean;
}) {
  return (
    <article className="market-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
      <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
        {label}
      </p>
      <h2 className="display-serif mt-3 text-4xl">
        {title}
      </h2>
      <div className="mt-7 divide-y divide-[var(--border)]">
        {holdings.map((holding, index) => (
          <div
            key={holding.fragranceId}
            className="flex items-center gap-4 py-5 first:pt-0"
          >
            <span className="display-serif text-2xl text-[var(--gold)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{holding.name}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {holding.brand} · {holding.wearCount} wears
              </p>
            </div>
            <div className="text-right">
              <p className="display-serif text-2xl text-[var(--gold-bright)]">
                ${holding.costPerWear.toFixed(2)}
              </p>
              <p className={`text-xs ${positive ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>
                {holding.efficiency}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
