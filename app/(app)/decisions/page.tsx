"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Beaker,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleDollarSign,
  Dna,
  FlaskConical,
  Gauge,
  Layers3,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  GitCompareArrows,
} from "lucide-react";

import { FragranceAsset } from "@/components/assets/fragrance-asset";
import { DecisionComparisonView } from "@/components/decision/decision-comparison-view";
import { DecisionMetric } from "@/components/decision/decision-metric";
import { CollectionImpactSimulator } from "@/components/intelligence/collection-impact-simulator";
import { NeuralActivityFeed } from "@/components/intelligence/neural-activity-feed";
import { NeuralConfidenceCore } from "@/components/intelligence/neural-confidence-core";
import { useCollection } from "@/components/providers/collection-provider";
import { Button } from "@/components/ui/button";
import {
  analyzeDecisionLab,
  type DecisionLabOutput,
} from "@/lib/intelligence/decision-lab-engine";
import { compareDecisionCandidates } from "@/lib/intelligence/decision-comparison-engine";

export default function DecisionsPage() {
  const {
    owned,
    available,
    analysis,
    addFragrance,
    hydrated,
  } = useCollection();

  const candidates = available;
  const [mode, setMode] = useState<"single" | "compare">("single");
  const [candidateId, setCandidateId] = useState(
    candidates[0]?.id ?? "",
  );
  const [secondCandidateId, setSecondCandidateId] = useState(
    candidates[1]?.id ?? candidates[0]?.id ?? "",
  );
  const [priceInput, setPriceInput] = useState("");
  const [secondPriceInput, setSecondPriceInput] = useState("");

  const selectedCandidate =
    candidates.find((candidate) => candidate.id === candidateId) ??
    candidates[0] ??
    null;

  const secondCandidate =
    candidates.find((candidate) => candidate.id === secondCandidateId) ??
    candidates.find((candidate) => candidate.id !== selectedCandidate?.id) ??
    null;

  const decision = useMemo(() => {
    if (!selectedCandidate) return null;

    const parsedPrice = Number(priceInput);

    return analyzeDecisionLab({
      candidate: selectedCandidate,
      owned: owned.map(({ fragrance }) => fragrance),
      analysis,
      price:
        Number.isFinite(parsedPrice) && parsedPrice > 0
          ? parsedPrice
          : undefined,
    });
  }, [analysis, owned, priceInput, selectedCandidate]);

  const comparison = useMemo(() => {
    if (
      !selectedCandidate ||
      !secondCandidate ||
      selectedCandidate.id === secondCandidate.id
    ) {
      return null;
    }

    const firstPrice = Number(priceInput);
    const secondPrice = Number(secondPriceInput);

    return compareDecisionCandidates({
      firstCandidate: selectedCandidate,
      secondCandidate,
      owned: owned.map(({ fragrance }) => fragrance),
      analysis,
      firstPrice:
        Number.isFinite(firstPrice) && firstPrice > 0
          ? firstPrice
          : undefined,
      secondPrice:
        Number.isFinite(secondPrice) && secondPrice > 0
          ? secondPrice
          : undefined,
    });
  }, [
    analysis,
    owned,
    priceInput,
    secondCandidate,
    secondPriceInput,
    selectedCandidate,
  ]);

  if (!selectedCandidate || !decision) {
    return (
      <section className="decision-empty rounded-[38px] border border-[var(--border)] p-12 text-center">
        <FlaskConical className="mx-auto text-[var(--gold)]" />
        <h1 className="display-serif mt-6 text-5xl">
          No decision candidate available.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">
          Every fragrance in the current intelligence catalog is already owned.
        </p>
      </section>
    );
  }

  return (
    <div className="decision-lab-page pb-12">
      <section className="decision-lab-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)]">
        <div className="decision-lab-grid pointer-events-none absolute inset-0" />
        <div className="decision-lab-aura pointer-events-none absolute -right-40 -top-40 h-[760px] w-[760px] rounded-full" />

        <div className="relative p-6 sm:p-10 xl:p-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="decision-command-mark grid h-11 w-11 place-items-center rounded-full">
                <FlaskConical size={18} />
              </span>

              <div>
                <p className="text-[.62rem] font-bold uppercase tracking-[.24em] text-[var(--gold-bright)]">
                  OLFACTUS Decision Lab
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Neural purchase analysis · {decision.modelVersion}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="decision-status-chip">
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                Decision engine ready
              </span>
              <span className="decision-status-chip">
                {decision.pipeline.length} analysis stages
              </span>
            </div>
          </div>

          <div className="mt-8 inline-flex rounded-2xl border border-[var(--border)] bg-black/10 p-1.5">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`decision-mode-button ${mode === "single" ? "is-active" : ""}`}
            >
              <FlaskConical size={15} />
              Single Decision
            </button>
            <button
              type="button"
              onClick={() => setMode("compare")}
              className={`decision-mode-button ${mode === "compare" ? "is-active" : ""}`}
            >
              <GitCompareArrows size={15} />
              Compare
            </button>
          </div>

          {mode === "compare" ? (
            <div className="mt-7 grid gap-4 rounded-[26px] border border-[var(--border)] bg-black/10 p-5 xl:grid-cols-2">
              <ComparisonSelector
                label="Candidate A"
                candidates={candidates}
                value={selectedCandidate.id}
                onChange={setCandidateId}
                price={priceInput}
                onPriceChange={setPriceInput}
              />
              <ComparisonSelector
                label="Candidate B"
                candidates={candidates}
                value={secondCandidate?.id ?? ""}
                onChange={setSecondCandidateId}
                price={secondPriceInput}
                onPriceChange={setSecondPriceInput}
              />
            </div>
          ) : (
          <div className="mt-9 grid gap-5 rounded-[26px] border border-[var(--border)] bg-black/10 p-5 xl:grid-cols-[1fr_220px]">
            <label className="decision-select">
              <span>Candidate fragrance</span>
              <select
                value={selectedCandidate.id}
                onChange={(event) => setCandidateId(event.target.value)}
              >
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.brand} — {candidate.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </label>

            <label className="decision-price">
              <span>Observed price</span>
              <div>
                <span>$</span>
                <input
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(event) => setPriceInput(event.target.value)}
                  placeholder={String(
                    selectedCandidate.market?.typicalMarketPrice ??
                      selectedCandidate.market?.retailPrice ??
                      180,
                  )}
                />
              </div>
            </label>
          </div>
          )}

          {mode === "compare" && comparison ? (
            <div className="mt-10">
              <DecisionComparisonView comparison={comparison} />
            </div>
          ) : null}

          {mode === "single" ? (
          <>
          <div className="mt-10 grid gap-12 xl:grid-cols-[1.03fr_.97fr] xl:items-center">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Should I buy?
              </p>

              <p className="mt-5 text-xs font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                {selectedCandidate.brand}
              </p>

              <h1 className="display-serif mt-2 text-[clamp(3.4rem,6.5vw,7rem)] leading-[.88] tracking-[-.055em]">
                {selectedCandidate.name}
              </h1>

              <div className="mt-8 flex flex-wrap items-end gap-5">
                <div
                  className={`decision-verdict decision-verdict-${decision.verdict}`}
                >
                  {decision.verdict}
                </div>

                <div>
                  <p className="display-serif text-5xl text-[var(--gold-bright)]">
                    {decision.score}
                  </p>
                  <p className="mt-1 text-[.58rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
                    Purchase score
                  </p>
                </div>
              </div>

              <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                {decision.analystReport}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {decision.verdict === "buy" ? (
                  <Button
                    variant="primary"
                    onClick={() => addFragrance(selectedCandidate.id)}
                  >
                    Add to collection
                    <ArrowRight size={15} />
                  </Button>
                ) : (
                  <Button variant="primary">
                    <Beaker size={16} />
                    Mark for sampling
                  </Button>
                )}

                <Button>
                  <BrainCircuit size={16} />
                  Save analysis
                </Button>
              </div>
            </div>

            <div className="decision-asset-stage relative min-h-[570px]">
              <div className="decision-orbit-system">
                <span className="decision-orbit orbit-one" />
                <span className="decision-orbit orbit-two" />
                <span className="decision-orbit orbit-three" />
                <span className="decision-orbit-node node-left" />
                <span className="decision-orbit-node node-right" />
              </div>

              <FragranceAsset
                fragranceId={selectedCandidate.id}
                brand={selectedCandidate.brand}
                name={selectedCandidate.name}
                mode="hero"
                priority
                showStatus
                className="relative z-10 h-[530px]"
              />

              <div className="absolute bottom-4 right-1 z-20">
                <NeuralConfidenceCore
                  value={decision.confidence}
                  label="Decision confidence"
                  size="medium"
                />
              </div>

              <div className="decision-floating-chip chip-health">
                <TrendingUp size={14} />
                Health +{decision.recommendation.projectedHealthGain}
              </div>
              <div className="decision-floating-chip chip-overlap">
                <Layers3 size={14} />
                {decision.metrics.overlapRisk}% overlap
              </div>
              <div className="decision-floating-chip chip-regret">
                <ShieldAlert size={14} />
                {decision.metrics.regretRisk}% regret risk
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-5">
            <HeroMetric
              label="Collection Fit"
              value={decision.metrics.collectionFit}
            />
            <HeroMetric
              label="DNA Expansion"
              value={decision.metrics.dnaExpansion}
            />
            <HeroMetric
              label="Performance"
              value={decision.metrics.performance}
            />
            <HeroMetric
              label="Value"
              value={decision.metrics.value}
            />
            <HeroMetric
              label="Long-Term Use"
              value={decision.metrics.longTermOwnership}
            />
          </div>
          </>
          ) : null}
        </div>
      </section>

      {mode === "single" ? (
      <>
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <article className="decision-analyst-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-10">
          <div className="flex items-center gap-3">
            <Sparkles size={17} className="text-[var(--gold-bright)]" />
            <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
              Analyst report
            </p>
          </div>

          <blockquote className="display-serif mt-7 text-3xl leading-[1.27] sm:text-4xl">
            “{decision.analystReport}”
          </blockquote>

          <div className="mt-8 grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-3">
            <AnalystFact
              icon={<Target size={16} />}
              label="Best role"
              value={
                decision.recommendation.primaryRole
                  ? capitalize(decision.recommendation.primaryRole)
                  : "Balanced use"
              }
            />
            <AnalystFact
              icon={<Dna size={16} />}
              label="Originality"
              value={`${decision.recommendation.originality}/100`}
            />
            <AnalystFact
              icon={<CircleDollarSign size={16} />}
              label="Value efficiency"
              value={`${decision.metrics.value}/100`}
            />
          </div>
        </article>

        <article className="decision-scorecard rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Decision breakdown
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                The verdict, quantified.
              </h2>
            </div>
            <Gauge size={46} strokeWidth={1} className="text-[var(--gold)] opacity-70" />
          </div>

          <div className="mt-8 space-y-6">
            <DecisionMetric
              label="Collection Fit"
              value={decision.metrics.collectionFit}
            />
            <DecisionMetric
              label="DNA Expansion"
              value={decision.metrics.dnaExpansion}
            />
            <DecisionMetric
              label="Season Value"
              value={decision.metrics.seasonValue}
            />
            <DecisionMetric
              label="Long-Term Ownership"
              value={decision.metrics.longTermOwnership}
            />
            <DecisionMetric
              label="Overlap Risk"
              value={decision.metrics.overlapRisk}
              inverse
            />
            <DecisionMetric
              label="Regret Risk"
              value={decision.metrics.regretRisk}
              inverse
            />
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <ReasonPanel
          title="Why buy"
          icon={<ShieldCheck size={18} />}
          reasons={decision.positiveReasons}
          type="positive"
        />

        <ReasonPanel
          title="Watch out"
          icon={<AlertTriangle size={18} />}
          reasons={decision.watchReasons}
          type="watch"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.04fr_.96fr]">
        <CollectionImpactSimulator
          recommendation={decision.recommendation}
        />
        <NeuralActivityFeed stages={decision.pipeline} />
      </section>

          </>
          ) : null}

      {!hydrated ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Loading saved collection before finalizing the verdict…
        </p>
      ) : null}
    </div>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="decision-hero-metric">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[.59rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
          {label}
        </p>
        <p className="text-sm text-[var(--gold-bright)]">{value}</p>
      </div>
      <div className="decision-progress mt-3">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function AnalystFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-[var(--gold)]">{icon}</span>
      <div>
        <p className="text-[.58rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
          {label}
        </p>
        <p className="mt-2 text-sm leading-6">{value}</p>
      </div>
    </div>
  );
}

function ReasonPanel({
  title,
  icon,
  reasons,
  type,
}: {
  title: string;
  icon: React.ReactNode;
  reasons: DecisionLabOutput["positiveReasons"];
  type: "positive" | "watch";
}) {
  return (
    <article
      className={`decision-reason-panel decision-reason-${type} rounded-[32px] border p-7 sm:p-9`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <p className="text-[.64rem] font-bold uppercase tracking-[.22em]">
          {title}
        </p>
      </div>

      <div className="mt-7 divide-y divide-[var(--border)]">
        {reasons.map((reason) => (
          <div key={reason.title} className="flex gap-4 py-5 first:pt-0">
            <span
              className={`decision-reason-icon decision-reason-icon-${type}`}
            >
              {type === "positive" ? (
                <Check size={12} />
              ) : (
                <AlertTriangle size={12} />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold">{reason.title}</p>
                {reason.score !== undefined ? (
                  <p className="text-sm text-[var(--gold-bright)]">
                    {reason.score}
                  </p>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {reason.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function ComparisonSelector({
  label,
  candidates,
  value,
  onChange,
  price,
  onPriceChange,
}: {
  label: string;
  candidates: Array<{
    id: string;
    brand: string;
    name: string;
    market?: {
      typicalMarketPrice?: number;
      retailPrice?: number;
    };
  }>;
  value: string;
  onChange: (value: string) => void;
  price: string;
  onPriceChange: (value: string) => void;
}) {
  const candidate = candidates.find((item) => item.id === value);

  return (
    <div className="comparison-selector-panel">
      <p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
        {label}
      </p>
      <label className="decision-select mt-3">
        <span>Fragrance</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {candidates.map((item) => (
            <option key={item.id} value={item.id}>
              {item.brand} — {item.name}
            </option>
          ))}
        </select>
        <ChevronDown size={15} />
      </label>
      <label className="decision-price mt-3">
        <span>Observed price</span>
        <div>
          <span>$</span>
          <input
            inputMode="decimal"
            value={price}
            onChange={(event) => onPriceChange(event.target.value)}
            placeholder={String(
              candidate?.market?.typicalMarketPrice ??
                candidate?.market?.retailPrice ??
                180,
            )}
          />
        </div>
      </label>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
