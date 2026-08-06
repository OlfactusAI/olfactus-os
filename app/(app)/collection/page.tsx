"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Compass,
  Database,
  Dna,
  Layers3,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { FragranceCard } from "@/components/features/fragrance-card";
import { useCollection } from "@/components/providers/collection-provider";
import { Button } from "@/components/ui/button";
import type { CollectionSort } from "@/lib/collection/store";
import type {
  DnaDimension,
  FragranceRecord,
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";
import { analyzeCollectionIntelligence } from "@/lib/intelligence/collection-intelligence";

const dnaKeys: DnaDimension[] = [
  "fresh",
  "green",
  "woody",
  "amber",
  "sweet",
  "dark",
  "artistic",
  "formal",
];

const seasons: Season[] = ["spring", "summer", "fall", "winter"];

const trackedRoles: FragranceRole[] = [
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

export default function CollectionPage() {
  const {
    owned,
    available,
    analysis,
    addFragrance,
    removeFragrance,
    logWear,
    toggleFavorite,
    resetCollection,
  } = useCollection();

  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [sort, setSort] = useState<CollectionSort>("name");
  const [showCatalog, setShowCatalog] = useState(false);
  const [showLibrary, setShowLibrary] = useState(true);

  const intelligence = analyzeCollectionIntelligence({
    owned,
    health: {
      score: analysis.score,
      status: analysis.status,
      summary: analysis.summary,
      confidence: analysis.confidence,
    },
  });

  const families = useMemo(
    () => ["all", ...new Set(owned.map(({ fragrance }) => fragrance.family))],
    [owned],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return [...owned]
      .filter(
        ({ fragrance }) =>
          family === "all" || fragrance.family === family,
      )
      .filter(
        ({ fragrance }) =>
          !normalized ||
          `${fragrance.name} ${fragrance.brand} ${fragrance.family}`
            .toLowerCase()
            .includes(normalized),
      )
      .sort((a, b) => {
        if (sort === "rating") {
          return (
            (b.item.personalRating ?? 0) -
            (a.item.personalRating ?? 0)
          );
        }

        if (sort === "wears") {
          return b.item.wearCount - a.item.wearCount;
        }

        if (sort === "last-worn") {
          return a.item.daysSinceLastWear - b.item.daysSinceLastWear;
        }

        return a.fragrance.name.localeCompare(b.fragrance.name);
      });
  }, [family, owned, query, sort]);

  const totalWears = owned.reduce(
    (sum, entry) => sum + entry.item.wearCount,
    0,
  );
  const favorites = owned.filter((entry) => entry.item.favorite).length;
  const neglected = intelligence.neglectedFragrances.length;

  const dnaProfile = useMemo(
    () =>
      dnaKeys
        .map((dimension) => ({
          dimension,
          value: owned.length
            ? Math.round(
                owned.reduce(
                  (sum, entry) =>
                    sum + entry.fragrance.dna[dimension],
                  0,
                ) / owned.length,
              )
            : 0,
        }))
        .sort((a, b) => b.value - a.value),
    [owned],
  );

  const seasonProfile = useMemo(
    () =>
      seasons.map((season) => ({
        season,
        value: owned.length
          ? Math.round(
              owned
                .map((entry) => entry.fragrance.seasons[season])
                .sort((a, b) => b - a)
                .slice(0, 3)
                .reduce((sum, value, _, values) => sum + value / values.length, 0),
            )
          : 0,
      })),
    [owned],
  );

  const roleProfile = useMemo(
    () =>
      trackedRoles
        .map((role) => {
          const count = owned.filter(({ fragrance }) =>
            fragrance.roles.includes(role),
          ).length;

          return {
            role,
            count,
            coverage:
              count === 0 ? 0 : count === 1 ? 68 : count === 2 ? 88 : 100,
          };
        })
        .sort((a, b) => b.coverage - a.coverage),
    [owned],
  );

  const overlaps = useMemo(() => {
    const rows: {
      first: FragranceRecord;
      second: FragranceRecord;
      similarity: number;
    }[] = [];

    for (let firstIndex = 0; firstIndex < owned.length; firstIndex += 1) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < owned.length;
        secondIndex += 1
      ) {
        const first = owned[firstIndex].fragrance;
        const second = owned[secondIndex].fragrance;
        const similarity = fragranceSimilarity(first, second);

        if (similarity >= 74) {
          rows.push({ first, second, similarity });
        }
      }
    }

    return rows.sort((a, b) => b.similarity - a.similarity).slice(0, 4);
  }, [owned]);

  const growthCandidates = useMemo(
    () =>
      analysis.recommendations
        .filter(
          (recommendation) =>
            recommendation.type === "buy" &&
            recommendation.targetFragranceId,
        )
        .map((recommendation) => {
          const fragrance = available.find(
            (candidate) =>
              candidate.id === recommendation.targetFragranceId,
          );

          return fragrance
            ? {
                fragrance,
                reason: recommendation.reason,
                projectedImpact: recommendation.projectedImpact,
                confidence: Math.round(recommendation.confidence * 100),
              }
            : null;
        })
        .filter(
          (
            candidate,
          ): candidate is {
            fragrance: FragranceRecord;
            reason: string;
            projectedImpact: number;
            confidence: number;
          } => Boolean(candidate),
        ),
    [analysis.recommendations, available],
  );

  const primaryGrowthCandidate =
    growthCandidates[0] ?? createFallbackGrowthCandidate(available, owned);

  const analystSummary = createAnalystSummary({
    analysis,
    intelligence,
    dnaProfile,
    overlaps,
  });

  return (
    <div className="collection-intelligence-page pb-12">
      <section className="collection-intelligence-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.23)] p-6 sm:p-10 xl:p-14">
        <div className="collection-neural-grid pointer-events-none absolute inset-0" />
        <div className="collection-hero-aura pointer-events-none absolute -right-40 -top-48 h-[720px] w-[720px] rounded-full" />

        <div className="relative grid gap-12 xl:grid-cols-[1.15fr_.85fr] xl:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="collection-command-mark grid h-11 w-11 place-items-center rounded-full">
                <BrainCircuit size={18} />
              </span>
              <div>
                <p className="text-[.62rem] font-bold uppercase tracking-[.24em] text-[var(--gold-bright)]">
                  OLFACTUS Collection Intelligence
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Live portfolio analysis · CIE-1.0.0
                </p>
              </div>
            </div>

            <h1 className="display-serif mt-8 max-w-4xl text-[clamp(3.5rem,7vw,7.4rem)] leading-[.88] tracking-[-.055em]">
              Your collection,
              <span className="block text-[var(--gold-bright)]">
                understood.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              OLFACTUS has analyzed {owned.length} fragrances, {totalWears} logged
              wears, every role, season, DNA dimension, and rotation signal in
              your collection.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => setShowCatalog((value) => !value)}
              >
                <Plus size={16} />
                {showCatalog ? "Close growth catalog" : "Add strategic fragrance"}
              </Button>

              <Button onClick={() => setShowLibrary((value) => !value)}>
                <Layers3 size={16} />
                {showLibrary ? "Hide bottle library" : "Show bottle library"}
              </Button>
            </div>
          </div>

          <div className="collection-health-stage relative mx-auto grid min-h-[450px] w-full max-w-[520px] place-items-center">
            <div className="collection-health-orbit">
              <span className="collection-health-ring collection-health-ring-one" />
              <span className="collection-health-ring collection-health-ring-two" />
              <span className="collection-health-ring collection-health-ring-three" />
              <span className="collection-health-node node-a" />
              <span className="collection-health-node node-b" />
              <span className="collection-health-node node-c" />
            </div>

            <div className="collection-health-core">
              <p className="text-[.61rem] font-bold uppercase tracking-[.2em] text-[var(--muted)]">
                Collection Health
              </p>
              <p className="display-serif mt-3 text-[clamp(6rem,10vw,9rem)] leading-none text-[var(--gold-bright)]">
                {analysis.score}
              </p>
              <p className="mt-3 text-lg font-semibold">{analysis.status}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {analysis.confidence}% intelligence confidence
              </p>
            </div>

            <div className="collection-health-chip collection-health-chip-top">
              <Database size={14} />
              {owned.length} fragrances
            </div>
            <div className="collection-health-chip collection-health-chip-right">
              <Activity size={14} />
              {totalWears} wears
            </div>
            <div className="collection-health-chip collection-health-chip-bottom">
              <Sparkles size={14} />
              {favorites} favorites
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label="Role Coverage"
            value={analysis.dimensions.roleCoverage}
            icon={<Target size={15} />}
          />
          <HeroMetric
            label="Season Balance"
            value={analysis.dimensions.seasonalBalance}
            icon={<Compass size={15} />}
          />
          <HeroMetric
            label="DNA Diversity"
            value={analysis.dimensions.diversity}
            icon={<Dna size={15} />}
          />
          <HeroMetric
            label="Rotation"
            value={analysis.dimensions.rotation}
            icon={<RotateCcw size={15} />}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.16fr_.84fr]">
        <article className="collection-analyst-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles size={17} className="text-[var(--gold-bright)]" />
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Neural analyst summary
              </p>
            </div>
            <span className="collection-live-chip">
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
              Generated live
            </span>
          </div>

          <blockquote className="display-serif mt-7 max-w-5xl text-3xl leading-[1.25] sm:text-4xl">
            “{analystSummary}”
          </blockquote>

          <div className="mt-8 grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-3">
            <AnalystFact
              icon={<ShieldCheck size={16} />}
              label="Strongest season"
              value={
                intelligence.strongestSeason
                  ? `${capitalize(intelligence.strongestSeason.season)} · ${intelligence.strongestSeason.score}/100`
                  : "Calibrating"
              }
            />
            <AnalystFact
              icon={<Target size={16} />}
              label="Strongest roles"
              value={
                intelligence.strongestRoles.length
                  ? intelligence.strongestRoles
                      .slice(0, 3)
                      .map(({ role }) => capitalize(role))
                      .join(" · ")
                  : "More data required"
              }
            />
            <AnalystFact
              icon={<AlertTriangle size={16} />}
              label="Priority signal"
              value={
                intelligence.priorityInsight?.title ??
                "No urgent collection gaps"
              }
            />
          </div>
        </article>

        <article className="collection-scorecard rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Intelligence scorecard
              </p>
              <h2 className="display-serif mt-3 text-4xl">Portfolio condition.</h2>
            </div>
            <BarChart3 size={46} strokeWidth={1} className="text-[var(--gold)] opacity-70" />
          </div>

          <div className="mt-8 space-y-6">
            <IntelligenceBar
              label="Role Coverage"
              value={analysis.dimensions.roleCoverage}
              note={metricStatus(analysis.dimensions.roleCoverage)}
            />
            <IntelligenceBar
              label="Season Balance"
              value={analysis.dimensions.seasonalBalance}
              note={metricStatus(analysis.dimensions.seasonalBalance)}
            />
            <IntelligenceBar
              label="DNA Diversity"
              value={analysis.dimensions.diversity}
              note={metricStatus(analysis.dimensions.diversity)}
            />
            <IntelligenceBar
              label="Redundancy Control"
              value={analysis.dimensions.redundancy}
              note={metricStatus(analysis.dimensions.redundancy)}
            />
            <IntelligenceBar
              label="Rotation Health"
              value={analysis.dimensions.rotation}
              note={metricStatus(analysis.dimensions.rotation)}
            />
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-12">
        <article className="collection-data-panel rounded-[30px] border border-[var(--border)] p-7 sm:p-9 xl:col-span-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Fragrance genome
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Your collection DNA.
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Average intensity across every owned fragrance
            </p>
          </div>

          <div className="dna-intelligence-grid mt-8">
            {dnaProfile.map(({ dimension, value }, index) => (
              <DnaVector
                key={dimension}
                label={capitalize(dimension)}
                value={value}
                rank={index + 1}
              />
            ))}
          </div>

          <div className="mt-8 rounded-[22px] border border-[rgba(232,200,127,.16)] bg-[rgba(232,200,127,.035)] p-5">
            <p className="text-[.61rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
              Dominant identity
            </p>
            <p className="display-serif mt-3 text-3xl">
              {dnaProfile
                .slice(0, 3)
                .map(({ dimension }) => capitalize(dimension))
                .join(" · ")}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Your strongest DNA directions currently define how the collection
              presents across daily wear, signature choices, and formal use.
            </p>
          </div>
        </article>

        <article className="collection-data-panel rounded-[30px] border border-[var(--border)] p-7 sm:p-9 xl:col-span-5">
          <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
            Seasonal architecture
          </p>
          <h2 className="display-serif mt-3 text-4xl">Coverage by climate.</h2>

          <div className="season-architecture mt-8 grid grid-cols-2 gap-4">
            {seasonProfile.map(({ season, value }) => (
              <SeasonCell key={season} season={season} value={value} />
            ))}
          </div>

          {intelligence.weakestSeason ? (
            <div className="mt-7 rounded-[22px] border border-[var(--border)] bg-black/10 p-5">
              <p className="text-[.61rem] font-bold uppercase tracking-[.16em] text-[var(--warning)]">
                Weakest season
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <p className="display-serif text-3xl capitalize">
                  {intelligence.weakestSeason.season}
                </p>
                <p className="display-serif text-4xl text-[var(--gold-bright)]">
                  {intelligence.weakestSeason.score}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Future additions should strengthen this season without repeating
                your dominant DNA.
              </p>
            </div>
          ) : null}
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <article className="collection-data-panel rounded-[30px] border border-[var(--border)] p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
                Role coverage
              </p>
              <h3 className="display-serif mt-3 text-3xl">Where you are ready.</h3>
            </div>
            <Target size={38} strokeWidth={1} className="text-[var(--gold)] opacity-60" />
          </div>

          <div className="mt-6 space-y-4">
            {roleProfile.slice(0, 6).map(({ role, coverage, count }) => (
              <CompactCoverageRow
                key={role}
                label={capitalize(role)}
                value={coverage}
                detail={`${count} bottle${count === 1 ? "" : "s"}`}
              />
            ))}
          </div>

          {intelligence.missingRoles.length ? (
            <div className="mt-7 border-t border-[var(--border)] pt-5">
              <p className="text-[.61rem] font-bold uppercase tracking-[.16em] text-[var(--warning)]">
                Missing roles
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {intelligence.missingRoles.map((role) => (
                  <span key={role} className="collection-gap-chip">
                    {capitalize(role)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </article>

        <article className="collection-data-panel rounded-[30px] border border-[var(--border)] p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
                Redundancy detector
              </p>
              <h3 className="display-serif mt-3 text-3xl">Overlap under control.</h3>
            </div>
            <Layers3 size={38} strokeWidth={1} className="text-[var(--gold)] opacity-60" />
          </div>

          <div className="mt-6">
            {overlaps.length ? (
              <div className="divide-y divide-[var(--border)]">
                {overlaps.map(({ first, second, similarity }) => (
                  <OverlapRow
                    key={`${first.id}-${second.id}`}
                    first={first.name}
                    second={second.name}
                    similarity={similarity}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-[rgba(85,173,129,.18)] bg-[rgba(85,173,129,.045)] p-5">
                <CheckCircle2 size={20} className="text-[var(--success)]" />
                <p className="mt-4 font-semibold">No major overlap cluster.</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Your collection remains functionally distinct across DNA and
                  roles.
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="collection-data-panel rounded-[30px] border border-[var(--border)] p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
                Rotation intelligence
              </p>
              <h3 className="display-serif mt-3 text-3xl">What needs attention.</h3>
            </div>
            <RotateCcw size={38} strokeWidth={1} className="text-[var(--gold)] opacity-60" />
          </div>

          <div className="mt-6">
            {intelligence.neglectedFragrances.length ? (
              <div className="divide-y divide-[var(--border)]">
                {intelligence.neglectedFragrances
                  .slice(0, 4)
                  .map((fragrance) => (
                    <div
                      key={fragrance.fragranceId}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="font-semibold">
                          {fragrance.fragranceName}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Rotation recovery opportunity
                        </p>
                      </div>
                      <p className="display-serif text-2xl text-[var(--warning)]">
                        {fragrance.daysSinceLastWear}d
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-[rgba(85,173,129,.18)] bg-[rgba(85,173,129,.045)] p-5">
                <CheckCircle2 size={20} className="text-[var(--success)]" />
                <p className="mt-4 font-semibold">Rotation is current.</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  No fragrance has crossed the 30-day neglect threshold.
                </p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[.86fr_1.14fr]">
        <article className="growth-opportunity-panel rounded-[32px] border border-[rgba(232,200,127,.22)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Highest growth opportunity
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Your next strategic addition.
              </h2>
            </div>
            <TrendingUp size={46} strokeWidth={1} className="text-[var(--gold)] opacity-70" />
          </div>

          {primaryGrowthCandidate ? (
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--gold)]">
                {primaryGrowthCandidate.fragrance.brand}
              </p>
              <p className="display-serif mt-2 text-5xl leading-tight">
                {primaryGrowthCandidate.fragrance.name}
              </p>
              <p className="mt-5 text-base leading-8 text-[var(--muted)]">
                {primaryGrowthCandidate.reason}
              </p>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <ForecastMetric
                  label="Health gain"
                  value={`+${primaryGrowthCandidate.projectedImpact}`}
                />
                <ForecastMetric
                  label="Confidence"
                  value={`${primaryGrowthCandidate.confidence}%`}
                />
                <ForecastMetric
                  label="Overlap risk"
                  value="Low"
                />
              </div>

              <Button
                variant="primary"
                className="mt-7"
                onClick={() =>
                  addFragrance(primaryGrowthCandidate.fragrance.id)
                }
              >
                Add strategic fragrance
                <ArrowRight size={15} />
              </Button>
            </div>
          ) : (
            <div className="mt-8 rounded-[22px] border border-[rgba(85,173,129,.18)] bg-[rgba(85,173,129,.045)] p-5">
              <CheckCircle2 size={20} className="text-[var(--success)]" />
              <p className="mt-4 font-semibold">Calibration catalog complete.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Every currently supported intelligence-ready fragrance is
                already owned.
              </p>
            </div>
          )}
        </article>

        <article className="collection-data-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Family architecture
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Where the collection concentrates.
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {intelligence.dominantFamilies.length} distinct families
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {intelligence.dominantFamilies.map((familyRow, index) => (
              <div
                key={familyRow.family}
                className="family-architecture-row rounded-[22px] border border-[var(--border)] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[.58rem] font-bold uppercase tracking-[.15em] text-[var(--muted)]">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 font-semibold">{familyRow.family}</p>
                  </div>
                  <p className="display-serif text-3xl text-[var(--gold-bright)]">
                    {familyRow.percentage}%
                  </p>
                </div>

                <div className="collection-progress-track mt-4">
                  <span style={{ width: `${familyRow.percentage}%` }} />
                </div>

                <p className="mt-3 text-xs text-[var(--muted)]">
                  {familyRow.count} fragrance{familyRow.count === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {showCatalog ? (
        <section className="mt-8 rounded-[32px] border border-[var(--border)] bg-black/10 p-7 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Strategic growth catalog
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Add intelligence-ready coverage.
              </h2>
            </div>
            <p className="max-w-md text-right text-sm leading-6 text-[var(--muted)]">
              Every addition immediately recalculates health, DNA, season,
              redundancy, and rotation intelligence.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {available.length ? (
              available.map((fragrance) => (
                <FragranceCard
                  key={fragrance.id}
                  fragrance={fragrance}
                  onAdd={() => addFragrance(fragrance.id)}
                />
              ))
            ) : (
              <p className="text-[var(--muted)]">
                Every calibration fragrance is already in your collection.
              </p>
            )}
          </div>
        </section>
      ) : null}

      {showLibrary ? (
        <section className="mt-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Bottle library
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Manage the underlying portfolio.
              </h2>
            </div>

            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <span>{filtered.length} shown</span>
              <span>{neglected} need rotation</span>
            </div>
          </div>

          <div className="collection-library-controls mb-6 rounded-[24px] border border-[var(--border)] p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  aria-label="Search collection"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by fragrance, house, or family"
                  className="focus-ring min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm text-[var(--foreground)]"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <label className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <select
                    value={family}
                    onChange={(event) => setFamily(event.target.value)}
                    className="focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-8 text-sm"
                  >
                    {families.map((option) => (
                      <option key={option} value={option}>
                        {option === "all" ? "All families" : option}
                      </option>
                    ))}
                  </select>
                </label>

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as CollectionSort)
                  }
                  className="focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm"
                >
                  <option value="name">Sort: Name</option>
                  <option value="rating">Sort: Rating</option>
                  <option value="wears">Sort: Wear count</option>
                  <option value="last-worn">Sort: Recently worn</option>
                </select>

                <Button onClick={resetCollection}>
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map(({ item, fragrance }) => (
              <FragranceCard
                key={item.fragranceId}
                fragrance={fragrance}
                item={item}
                onLogWear={() => logWear(fragrance.id)}
                onRemove={() => removeFragrance(fragrance.id)}
                onToggleFavorite={() => toggleFavorite(fragrance.id)}
              />
            ))}
          </div>

          {!filtered.length ? (
            <div className="mt-4 rounded-[28px] border border-[var(--border)] p-8 text-center">
              <h2 className="display-serif text-3xl">No fragrances found</h2>
              <p className="mt-3 text-[var(--muted)]">
                Adjust the search or family filter.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function HeroMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="collection-hero-metric">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[.61rem] font-bold uppercase tracking-[.15em] text-[var(--muted)]">
          {label}
        </p>
        <span className="text-[var(--gold)]">{icon}</span>
      </div>
      <p className="display-serif mt-3 text-4xl text-[var(--gold-bright)]">
        {value}
      </p>
      <div className="collection-progress-track mt-3">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function IntelligenceBar({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs capitalize text-[var(--muted)]">{note}</p>
        </div>
        <p className="display-serif text-3xl text-[var(--gold-bright)]">
          {value}
        </p>
      </div>
      <div className="collection-progress-track mt-3">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function DnaVector({
  label,
  value,
  rank,
}: {
  label: string;
  value: number;
  rank: number;
}) {
  return (
    <div className="dna-vector-row">
      <div className="flex items-center gap-4">
        <span className="display-serif text-2xl text-[var(--gold)]">
          {String(rank).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold">{label}</p>
            <p className="text-sm text-[var(--gold-bright)]">{value}</p>
          </div>
          <div className="dna-vector-track mt-3">
            <span style={{ width: `${value}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SeasonCell({
  season,
  value,
}: {
  season: Season;
  value: number;
}) {
  return (
    <div className="season-cell rounded-[22px] border border-[var(--border)] p-5">
      <p className="text-[.6rem] font-bold uppercase tracking-[.17em] text-[var(--muted)]">
        {season}
      </p>
      <p className="display-serif mt-3 text-4xl text-[var(--gold-bright)]">
        {value}
      </p>
      <div className="collection-progress-track mt-4">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CompactCoverageRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{detail}</p>
        </div>
        <p className="text-sm text-[var(--gold-bright)]">{value}</p>
      </div>
      <div className="collection-progress-track mt-2">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function OverlapRow({
  first,
  second,
  similarity,
}: {
  first: string;
  second: string;
  similarity: number;
}) {
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{first}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{second}</p>
        </div>
        <p className="display-serif text-2xl text-[var(--warning)]">
          {similarity}%
        </p>
      </div>
      <div className="overlap-track mt-3">
        <span style={{ width: `${similarity}%` }} />
      </div>
    </div>
  );
}

function ForecastMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="forecast-metric rounded-[20px] border border-[var(--border)] p-4">
      <p className="text-[.58rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-3xl text-[var(--gold-bright)]">
        {value}
      </p>
    </div>
  );
}

function AnalystFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-[var(--gold)]">{icon}</span>
      <div>
        <p className="text-[.59rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
          {label}
        </p>
        <p className="mt-2 text-sm leading-6">{value}</p>
      </div>
    </div>
  );
}

function fragranceSimilarity(
  first: FragranceRecord,
  second: FragranceRecord,
) {
  let dotProduct = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (const key of dnaKeys) {
    dotProduct += first.dna[key] * second.dna[key];
    firstMagnitude += first.dna[key] ** 2;
    secondMagnitude += second.dna[key] ** 2;
  }

  const dnaSimilarity =
    dotProduct /
    (Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude) || 1);

  const sharedRoles = first.roles.filter((role) =>
    second.roles.includes(role),
  ).length;
  const unionRoles = new Set([...first.roles, ...second.roles]).size;
  const roleSimilarity = sharedRoles / Math.max(1, unionRoles);

  return Math.round((dnaSimilarity * 0.65 + roleSimilarity * 0.35) * 100);
}

function createFallbackGrowthCandidate(
  available: FragranceRecord[],
  owned: Array<{ fragrance: FragranceRecord }>,
) {
  if (!available.length) return null;

  const ownedFamilies = new Set(
    owned.map(({ fragrance }) => fragrance.family.toLowerCase()),
  );

  const candidate =
    available.find(
      (fragrance) => !ownedFamilies.has(fragrance.family.toLowerCase()),
    ) ?? available[0];

  return {
    fragrance: candidate,
    reason: `This adds ${candidate.family} coverage while expanding the collection beyond its current family architecture.`,
    projectedImpact: 3,
    confidence: 84,
  };
}

function createAnalystSummary({
  analysis,
  intelligence,
  dnaProfile,
  overlaps,
}: {
  analysis: {
    score: number;
    status: string;
    dimensions: {
      roleCoverage: number;
      seasonalBalance: number;
      diversity: number;
      redundancy: number;
      rotation: number;
    };
  };
  intelligence: ReturnType<typeof analyzeCollectionIntelligence>;
  dnaProfile: { dimension: DnaDimension; value: number }[];
  overlaps: { similarity: number }[];
}) {
  const dominantDna = dnaProfile
    .slice(0, 3)
    .map(({ dimension }) => capitalize(dimension))
    .join(", ");

  const seasonSentence = intelligence.strongestSeason
    ? `${capitalize(intelligence.strongestSeason.season)} is currently your strongest season at ${intelligence.strongestSeason.score}/100.`
    : "Seasonal intelligence is still calibrating.";

  const gapSentence = intelligence.priorityInsight
    ? `${intelligence.priorityInsight.title}.`
    : "No urgent collection gap is currently detected.";

  const overlapSentence = overlaps.length
    ? `${overlaps.length} meaningful overlap signal${overlaps.length === 1 ? "" : "s"} should be considered before the next purchase.`
    : "Redundancy remains low, leaving future additions efficient.";

  return `Your collection is operating at ${analysis.score}/100 with ${analysis.status.toLowerCase()} health. Its identity centers on ${dominantDna}. ${seasonSentence} ${gapSentence} ${overlapSentence}`;
}

function metricStatus(value: number) {
  if (value >= 90) return "exceptional";
  if (value >= 80) return "strong";
  if (value >= 70) return "healthy";
  if (value >= 55) return "developing";
  return "priority";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
