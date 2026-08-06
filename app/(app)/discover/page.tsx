"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  Compass,
  Dna,
  Gauge,
  Layers3,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { FragranceAsset } from "@/components/assets/fragrance-asset";
import { DiscoveryRecommendationCard } from "@/components/discovery/discovery-recommendation-card";
import { CollectionImpactSimulator } from "@/components/intelligence/collection-impact-simulator";
import { NeuralActivityFeed } from "@/components/intelligence/neural-activity-feed";
import { NeuralConfidenceCore } from "@/components/intelligence/neural-confidence-core";
import { useCollection } from "@/components/providers/collection-provider";
import { Button } from "@/components/ui/button";
import type {
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";
import {
  generateDiscoveryIntelligence,
  type DiscoveryRecommendation,
} from "@/lib/intelligence/discovery-engine";

const seasonOptions: Season[] = [
  "spring",
  "summer",
  "fall",
  "winter",
];

const roleOptions: FragranceRole[] = [
  "office",
  "casual",
  "date",
  "formal",
  "summer",
  "winter",
  "creative",
  "signature",
  "travel",
];

export default function DiscoverPage() {
  const {
    owned,
    available,
    analysis,
    addFragrance,
    hydrated,
  } = useCollection();

  const [desiredSeason, setDesiredSeason] =
    useState<Season>("summer");
  const [desiredRole, setDesiredRole] =
    useState<FragranceRole>("office");
  const [expanded, setExpanded] = useState(false);

  const discovery = useMemo(
    () =>
      generateDiscoveryIntelligence({
        owned: owned.map(({ fragrance }) => fragrance),
        candidates: available,
        analysis,
        desiredSeason,
        desiredRole,
      }),
    [analysis, available, desiredRole, desiredSeason, owned],
  );

  const primary = discovery.primary;
  const feed = discovery.opportunityFeed;

  return (
    <div className="discovery-intelligence-page pb-12">
      <section className="discovery-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)]">
        <div className="discovery-grid pointer-events-none absolute inset-0" />
        <div className="discovery-aura pointer-events-none absolute -right-44 -top-40 h-[760px] w-[760px] rounded-full" />

        <div className="relative p-6 sm:p-10 xl:p-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="discovery-command-mark grid h-11 w-11 place-items-center rounded-full">
                <Compass size={18} />
              </span>
              <div>
                <p className="text-[.62rem] font-bold uppercase tracking-[.24em] text-[var(--gold-bright)]">
                  OLFACTUS Discovery Intelligence
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Personalized recommendation synthesis · {discovery.modelVersion}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="discovery-status-chip">
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                Engine active
              </span>
              <span className="discovery-status-chip">
                {discovery.confidence}% system confidence
              </span>
            </div>
          </div>

          {primary ? (
            <div className="mt-10 grid gap-12 xl:grid-cols-[1.05fr_.95fr] xl:items-center">
              <div>
                <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                  Recommended for you
                </p>

                <h1 className="display-serif mt-5 max-w-4xl text-[clamp(3.4rem,6.7vw,7rem)] leading-[.88] tracking-[-.055em]">
                  Discover what your
                  <span className="block text-[var(--gold-bright)]">
                    collection is missing.
                  </span>
                </h1>

                <div className="mt-10">
                  <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                    {primary.fragrance.brand}
                  </p>
                  <h2 className="display-serif mt-2 text-[clamp(2.7rem,5vw,5.4rem)] leading-[.94]">
                    {primary.fragrance.name}
                  </h2>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                    {primary.summary}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    onClick={() =>
                      addFragrance(primary.fragrance.id)
                    }
                  >
                    Add strategic fragrance
                    <ArrowRight size={15} />
                  </Button>

                  <Button onClick={() => setExpanded((value) => !value)}>
                    <BrainCircuit size={16} />
                    {expanded ? "Hide analysis" : "View full analysis"}
                  </Button>
                </div>
              </div>

              <div className="discovery-asset-stage relative min-h-[540px]">
                <div className="discovery-orbit-system">
                  <span className="discovery-orbit discovery-orbit-one" />
                  <span className="discovery-orbit discovery-orbit-two" />
                  <span className="discovery-orbit discovery-orbit-three" />
                  <span className="discovery-node discovery-node-a" />
                  <span className="discovery-node discovery-node-b" />
                </div>

                <FragranceAsset
                  fragranceId={primary.fragrance.id}
                  brand={primary.fragrance.brand}
                  name={primary.fragrance.name}
                  mode="hero"
                  priority
                  showStatus
                  className="relative z-10 h-[520px]"
                />

                <div className="absolute bottom-5 right-2 z-20">
                  <NeuralConfidenceCore
                    value={primary.confidence}
                    label="Confidence"
                    size="medium"
                  />
                </div>

                <div className="discovery-floating-chip discovery-chip-health">
                  <TrendingUp size={14} />
                  Health +{primary.projectedHealthGain}
                </div>
                <div className="discovery-floating-chip discovery-chip-risk">
                  <ShieldCheck size={14} />
                  {formatRisk(primary.blindBuyRisk)} risk
                </div>
                <div className="discovery-floating-chip discovery-chip-dna">
                  <Dna size={14} />
                  {primary.dnaMatch}% DNA fit
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center">
              <Sparkles className="mx-auto text-[var(--gold)]" />
              <h1 className="display-serif mt-6 text-5xl">
                Your calibration catalog is complete.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
                Every currently supported discovery candidate is already in
                your collection.
              </p>
            </div>
          )}

          {primary ? (
            <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-5">
              {primary.signals
                .filter((signal) => signal.id !== "data-confidence")
                .slice(0, 5)
                .map((signal, index) => (
                  <div key={signal.id} className="discovery-signal">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[.59rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
                        {String(index + 1).padStart(2, "0")} · {signal.label}
                      </p>
                      <strong className="text-sm text-[var(--gold-bright)]">
                        {signal.score}
                      </strong>
                    </div>
                    <div className="discovery-progress mt-3">
                      <span style={{ width: `${signal.score}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-8 rounded-[30px] border border-[var(--border)] bg-black/10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[.61rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
              Discovery objective
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Adjust the context and the engine will rescore every candidate.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="discovery-select-wrap">
              <span>Season</span>
              <select
                value={desiredSeason}
                onChange={(event) =>
                  setDesiredSeason(event.target.value as Season)
                }
              >
                {seasonOptions.map((season) => (
                  <option key={season} value={season}>
                    {capitalize(season)}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>

            <label className="discovery-select-wrap">
              <span>Role</span>
              <select
                value={desiredRole}
                onChange={(event) =>
                  setDesiredRole(event.target.value as FragranceRole)
                }
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {capitalize(role)}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
        </div>
      </section>

      {expanded && primary ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.12fr_.88fr]">
          <article className="discovery-analyst-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-10">
            <div className="flex items-center gap-3">
              <BrainCircuit size={17} className="text-[var(--gold-bright)]" />
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Full recommendation analysis
              </p>
            </div>

            <blockquote className="display-serif mt-7 text-3xl leading-[1.25] sm:text-4xl">
              “{primary.analystNarrative}”
            </blockquote>

            <div className="mt-8 grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
              {primary.signals.map((signal) => (
                <div
                  key={signal.id}
                  className="rounded-[22px] border border-[var(--border)] bg-white/[.02] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold">{signal.label}</p>
                    <p className="display-serif text-2xl text-[var(--gold-bright)]">
                      {signal.score}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {signal.explanation}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <CollectionImpactSimulator recommendation={primary} />
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.12fr_.88fr]">
        {primary ? (
          <article className="neural-analyst-summary rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <BrainCircuit size={17} className="text-[var(--gold-bright)]" />
              <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
                Neural recommendation analysis
              </p>
            </div>
            <blockquote className="display-serif mt-7 text-3xl leading-[1.28] sm:text-4xl">
              “{primary.analystNarrative}”
            </blockquote>
            <div className="mt-8 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-3">
              {primary.reasons.slice(0, 3).map((reason) => (
                <div key={reason} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[rgba(85,173,129,.1)] text-[var(--success)]">
                    <Check size={12} />
                  </span>
                  <p className="text-sm leading-6 text-[var(--muted)]">{reason}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}
        <NeuralActivityFeed stages={discovery.pipeline} />
      </section>

      <section className="mt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
              Personalized recommendation set
            </p>
            <h2 className="display-serif mt-3 text-4xl sm:text-5xl">
              Ranked by strategic value.
            </h2>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {discovery.recommendations.length} candidates analyzed
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {discovery.recommendations.map((recommendation, index) => (
            <DiscoveryRecommendationCard
              key={recommendation.fragrance.id}
              recommendation={recommendation}
              featured={index === 0}
              onAdd={() =>
                addFragrance(recommendation.fragrance.id)
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-12">
        <article className="discovery-opportunity-panel rounded-[30px] border border-[var(--border)] p-7 sm:p-9 xl:col-span-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Opportunity feed
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Four ways to grow.
              </h2>
            </div>
            <Target size={46} strokeWidth={1} className="text-[var(--gold)] opacity-70" />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <OpportunityRow
              label="Highest impact"
              recommendation={feed.highestImpact}
              icon={<TrendingUp size={16} />}
            />
            <OpportunityRow
              label="Safest buy"
              recommendation={feed.safestBuy}
              icon={<ShieldCheck size={16} />}
            />
            <OpportunityRow
              label="Signature potential"
              recommendation={feed.signaturePotential}
              icon={<Sparkles size={16} />}
            />
            <OpportunityRow
              label="Most original"
              recommendation={feed.mostOriginal}
              icon={<Dna size={16} />}
            />
          </div>
        </article>

        <article className="discovery-roadmap-panel rounded-[30px] border border-[var(--border)] p-7 sm:p-9 xl:col-span-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Discovery roadmap
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Not a shopping list.
              </h2>
            </div>
            <Route size={46} strokeWidth={1} className="text-[var(--gold)] opacity-70" />
          </div>

          <div className="mt-8">
            <RoadmapRow
              step="01"
              label="Explore next"
              recommendation={discovery.roadmap.next}
            />
            <RoadmapRow
              step="02"
              label="Consider later"
              recommendation={discovery.roadmap.later}
            />
            <RoadmapRow
              step="03"
              label="Eventually"
              recommendation={discovery.roadmap.eventually}
              last
            />
          </div>
        </article>
      </section>

      {!hydrated ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Loading your saved collection before finalizing recommendations…
        </p>
      ) : null}
    </div>
  );
}

function OpportunityRow({
  label,
  recommendation,
  icon,
}: {
  label: string;
  recommendation: DiscoveryRecommendation | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-white/[.022] p-5">
      <div className="flex items-center gap-2 text-[var(--gold)]">
        {icon}
        <p className="text-[.58rem] font-bold uppercase tracking-[.15em]">
          {label}
        </p>
      </div>
      <p className="display-serif mt-4 text-2xl">
        {recommendation?.fragrance.name ?? "No candidate"}
      </p>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        {recommendation
          ? `${recommendation.confidence}% confidence · +${recommendation.projectedHealthGain} health`
          : "Add more catalog data to unlock this signal."}
      </p>
    </div>
  );
}

function RoadmapRow({
  step,
  label,
  recommendation,
  last = false,
}: {
  step: string;
  label: string;
  recommendation: DiscoveryRecommendation | null;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-8">
      {!last ? <span className="roadmap-line" /> : null}
      <span className="roadmap-step">{step}</span>
      <div>
        <p className="text-[.58rem] font-bold uppercase tracking-[.15em] text-[var(--muted)]">
          {label}
        </p>
        <p className="display-serif mt-2 text-2xl">
          {recommendation?.fragrance.name ?? "Awaiting candidate"}
        </p>
        {recommendation ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            {recommendation.score}/100 strategic score
          </p>
        ) : null}
      </div>
    </div>
  );
}

function formatRisk(
  value: DiscoveryRecommendation["blindBuyRisk"],
) {
  return {
    "very-low": "Very low",
    low: "Low",
    moderate: "Moderate",
    high: "High",
  }[value];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
